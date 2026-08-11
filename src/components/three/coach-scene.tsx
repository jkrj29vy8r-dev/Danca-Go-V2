"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  Lightformer,
  Preload,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Coach, type CoachDetail } from "./coach";
import { DepthField } from "./depth-field";
import { detectQuality, type QualitySettings } from "./quality";
import { clamp } from "@/lib/utils";

/**
 * Studio rig for the hero coach.
 *
 * Lighting is built from drei <Lightformer> panels inside a locally-rendered
 * <Environment> — no HDR file is fetched, so there's no external request, no
 * CSP exception and no multi-megabyte blocking download. The long horizontal
 * strips are the point: real automotive photography works by dragging a
 * softbox strip down the flank, and a clearcoat material with nothing to
 * reflect is exactly what plastic looks like.
 *
 * Everything is prop-driven so the scene can be reused outside the hero
 * (fleet pages, a configurator) without editing the component.
 */

export type CoachSceneProps = {
  /** Continuous turntable speed, radians per second. 0 disables it. */
  autoRotate?: number;
  /** Drifting motes around the subject; adds depth for one draw call. */
  depthField?: boolean;
  /** How far scroll swings the coach toward a side profile, in radians. */
  scrollInfluence?: number;
  /** Pointer parallax strength, in radians. */
  pointerInfluence?: number;
  /** Vertical float amplitude, in metres. */
  floatAmplitude?: number;
  /** Override the probed device tier — mainly for testing. */
  quality?: QualitySettings;
  className?: string;
};

/**
 * Viewing direction — a three-quarter front angle just under 3.5° above the
 * target. Near eye-level is what makes a vehicle read as heroic; looking down
 * on the roof makes it read as a toy.
 *
 * The y component is small because the camera's *height* is `TARGET.y + d·y`
 * and the fit puts d at ~16m: at 0.13 that landed the camera at 4.13m, above
 * the 3.93m roof, so the shot stared down at the roof panel — the exact
 * failure this comment warns about. 0.06 holds it at ~3.0m, level with the
 * glazing, which is where automotive photography puts it.
 *
 * The horizontal bias is deliberately modest. A hard three-quarter angle on a
 * 12m subject puts the near end at ~10m and the far end at ~22m, and that 2.2×
 * size ratio foreshortens the body into a wedge — it stops reading as a coach
 * and starts reading as a truck trailer. Swinging toward the flank compresses
 * that ratio and shows the two features that carry the vehicle's identity:
 * the window band and the gold beltline running its full length.
 */
const DIRECTION = new THREE.Vector3(0.58, 0.055, 0.81).normalize();

/**
 * The coach's envelope, as a **cylinder** rather than a box, in metres.
 *
 * The subject is on a continuous turntable, so any box-shaped frame is only
 * correct at one heading. The swept envelope of a 12m × 2.55m body rotating
 * about Y is a cylinder of radius √(6² + 1.275²) ≈ 6.13 — that number holds at
 * every angle, which is what makes the fit below stable while the coach spins.
 *
 * Measure it from the *extremities*, not the body shell: the front bumper
 * reaches x = 6.29 and the lamps sit proud of that, so the true swept radius is
 * √(6.29² + 1.275²) ≈ 6.42. Using the shell's 6.15 under-counted by 5%, which
 * is small enough to look intentional and wrong enough to slice the nose off
 * against the right-hand frustum wall.
 */
const SUBJECT_RADIUS = 6.5;
/** Half the overall height: ground to the top of the roof cowling is ~4.1m. */
const SUBJECT_HALF_HEIGHT = 2.1;
/**
 * Breathing room. A fit that is exactly tight puts the bodywork on the frame
 * edge, which reads as a cropping accident rather than a composition — and
 * leaves nothing for the float and pointer parallax to move into.
 */
const FRAME_MARGIN = 1.08;
/** Vertical centre of that envelope — also where the camera looks. */
const TARGET = new THREE.Vector3(0, 2.05, 0);

/* -------------------------------------------------------------------------- */
/*                                   CAMERA                                    */
/* -------------------------------------------------------------------------- */

/**
 * Frames the vehicle.
 *
 * Neither R3F's `camera` prop nor drei's <PerspectiveCamera> orients itself,
 * so without this the camera stares off down -Z. It also solves the camera
 * distance from the canvas aspect ratio, which is what keeps the coach fully
 * in frame on a wide desktop band and a narrow phone alike.
 */
function CameraRig() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    const aspect = width / Math.max(height, 1);
    const tanV = Math.tan((camera.fov * Math.PI) / 360);
    const tanH = tanV * aspect;

    // Horizontal: the frustum has to clear the *tangent* of the swept
    // cylinder, so this is a sine rather than the naive width / 2·tan — the
    // widest part of the subject is not on the plane the camera looks at.
    const sinH = tanH / Math.sqrt(1 + tanH * tanH);
    const distanceForWidth = SUBJECT_RADIUS / sinH;

    // Vertical: the top edge that crops first is the one nearest the camera,
    // a full radius closer than the centre. Solving as if the subject were a
    // flat plane at the target — which an earlier version did — under-counts
    // by exactly that radius, and the roof and wheels get sliced off.
    const distanceForHeight = SUBJECT_RADIUS + SUBJECT_HALF_HEIGHT / tanV;

    const distance = THREE.MathUtils.clamp(
      Math.max(distanceForWidth, distanceForHeight) * FRAME_MARGIN,
      9.5,
      60,
    );

    camera.position.copy(DIRECTION).multiplyScalar(distance).add(TARGET);
    camera.lookAt(TARGET);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                    RIG                                      */
/* -------------------------------------------------------------------------- */

/**
 * Drives the coach's pose from three independent sources:
 *
 *   auto     — a constant turntable, so the scene is alive when nothing happens
 *   scroll   — swings toward a side profile as the hero leaves the viewport
 *   pointer  — a small parallax nudge, damped so it never feels twitchy
 *
 * Auto-rotation accumulates (it's a velocity), while scroll and pointer are
 * absolute offsets applied on top. Keeping them separate means scrolling back
 * up returns to the same relative pose instead of fighting the turntable.
 */
function CoachRig({
  autoRotate,
  scrollInfluence,
  pointerInfluence,
  floatAmplitude,
  detail,
}: Required<Pick<
  CoachSceneProps,
  "autoRotate" | "scrollInfluence" | "pointerInfluence" | "floatAmplitude"
>> & { detail: CoachDetail }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // Guard against tab-restore producing a huge delta and a visible jump.
    const dt = Math.min(delta, 1 / 30);

    spin.current += dt * autoRotate;

    const outerNode = outer.current;
    const innerNode = inner.current;
    if (!outerNode || !innerNode) return;

    const progress = clamp(window.scrollY / window.innerHeight, 0, 1);

    const targetY = spin.current + progress * scrollInfluence + state.pointer.x * pointerInfluence;
    const targetX = 0.02 + progress * 0.06 - state.pointer.y * (pointerInfluence * 0.4);

    // Frame-rate independent damping. Y is followed tightly so the constant
    // turntable doesn't lag behind itself; X stays soft for the parallax.
    const tight = 1 - Math.pow(0.0001, dt);
    const soft = 1 - Math.pow(0.001, dt);

    outerNode.rotation.y = THREE.MathUtils.lerp(outerNode.rotation.y, targetY, tight);
    outerNode.rotation.x = THREE.MathUtils.lerp(outerNode.rotation.x, targetX, soft);
    outerNode.position.z = THREE.MathUtils.lerp(outerNode.position.z, progress * -2.2, soft);

    // Float lives on the inner group so it composes with rotation cleanly.
    //
    // Biased to [0, amplitude] rather than centred on zero: the wheels rest at
    // y=0 and the contact-shadow plane sits just above it, so a float that
    // swings negative pushes the tyres *through* the shadow and clips their
    // lower half into crescents. A vehicle may hover; it may not sink.
    innerNode.position.y =
      (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.55)) * floatAmplitude;
  });

  return (
    <group
      ref={outer}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={inner}>
        <Coach hovered={hovered} detail={detail} />
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  LIGHTING                                   */
/* -------------------------------------------------------------------------- */

function StudioLighting({ quality }: { quality: QualitySettings }) {
  return (
    <>
      {/* Deliberately low. The coach is a *dark* vehicle: its form should come
          from reflected strips and edge highlights, not from flat fill. An
          earlier pass raised this to 0.85 to stop the body reading as a black
          box — but with the paint's metalness also corrected, that much
          ambient washed it out into a pale silver bus instead. The fix for a
          black box is reflections, not brightness. */}
      <ambientLight intensity={0.22} />

      {/* Key light, camera-left and high */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={1.4}
        castShadow={quality.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        // A directional light's default shadow frustum is a 10m box, which
        // cuts straight through a 12m coach and leaves hard-edged rectangles
        // on the ground where the shadow map simply stops.
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
      />

      {/* Gold rim along the top edge — the brand colour reading as light */}
      <directionalLight position={[-10, 6, -6]} intensity={1.2} color="#c8a468" />

      {/* Hard back-rim from behind the far shoulder. This is what separates a
          near-black vehicle from a near-black background: without an edge
          catching light, the silhouette dissolves into the page. */}
      <directionalLight position={[-6, 5, 9]} intensity={1.0} color="#dbe6ff" />

      {/* Cool fill from below-front, keeps the shadows from going muddy */}
      <directionalLight position={[4, -2, 10]} intensity={0.25} color="#6f8cff" />

      <SweepLight />

      {/* `frames={1}` bakes the cube map once — the rig is static, so there's
          no reason to re-render it every frame. */}
      <Environment resolution={quality.envResolution} frames={1}>
        <GradientDome />

        {/* Large soft overhead softbox */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[0, 8, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 8, 1]}
        />

        {/* Flank strips — the "is this metal or plastic" decider.
            Bright but *narrow* is the whole trick, and it took measuring
            pixels to get right: glossy dark paint is a dark diffuse base
            carrying a thin brilliant specular streak. Wide-and-dim gives a
            flat matte flank (measured: median 31, p95 33 — no variation at
            all); wide-and-bright turns the entire side into one reflection.
            Narrow-and-bright is what actually reads as wet paint. */}
        <Lightformer form="rect" intensity={7} position={[0, 4.2, 9]} scale={[20, 0.22, 1]} />
        <Lightformer form="rect" intensity={4} position={[0, 1.7, 9]} scale={[20, 0.14, 1]} />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, 3, -9]}
          rotation={[0, Math.PI, 0]}
          scale={[22, 1.0, 1]}
        />

        {/* Wraps the nose and front quarter, which the flank strips miss */}
        <Lightformer
          form="rect"
          intensity={2}
          position={[11, 3.4, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 1.6, 1]}
        />

        {/* Warm gold kicker and a cool counterpoint */}
        <Lightformer
          form="circle"
          intensity={3}
          color="#c8a468"
          position={[-9, 4, -4]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          form="circle"
          intensity={1.6}
          color="#9db4ff"
          position={[10, 2, 4]}
          scale={[4, 4, 1]}
        />
      </Environment>
    </>
  );
}

/**
 * A single light that tracks slowly along the flank.
 *
 * The environment cube map is baked once (`frames={1}`), which is what keeps
 * the scene cheap — but it also means every reflection on the bodywork is
 * frozen. A moving directional light is the affordable way to get the one
 * thing a static bake cannot give: a highlight that travels, so the paint
 * looks wet rather than painted-on. One light, no re-bake, no extra pass.
 */
function SweepLight() {
  const light = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const node = light.current;
    if (!node) return;
    const t = state.clock.elapsedTime * 0.18;
    node.position.set(Math.cos(t) * 14, 7 + Math.sin(t * 0.7) * 2.5, Math.sin(t) * 14);
  });

  return <directionalLight ref={light} intensity={0.5} color="#ffffff" />;
}

/**
 * Graded dome for the *environment map only*, carrying the studio's cyclorama
 * light band.
 *
 * Pure black gives the clearcoat nothing to reflect in the gaps between the
 * lightformer strips, which is what flattens a car render. This restores that
 * falloff for the cost of one unlit sphere.
 *
 * It must live inside <Environment>, not in the scene: Environment children
 * are rendered into a cube target, so this shapes reflections while staying
 * invisible to the camera. Put the same mesh in the scene graph and it just
 * paints an opaque box over the transparent canvas — which is exactly what
 * happened the first time.
 *
 * THE HORIZON BAND is the reason the flank has any tone at all. The rectangular
 * <Lightformer> strips are fixed in space, but the coach is on a turntable, so
 * they only line up with it at one heading — traced against the real camera,
 * the bodyside reflected to x = −3.7 … −22.7 while the strips only spanned
 * x ∈ [−10, 10], and the measured flank came back with a luminance range of
 * **1** (p05 12, p95 13): flatter than the empty page behind it.
 *
 * A band built into the dome is radially symmetric, so it lands on the flank at
 * every heading. It sits just *below* the horizon because that is where a
 * vertical glossy panel sends a near-eye-level camera — the traced reflections
 * all come back at direction.y ≈ −0.05. Being part of the dome, it is baked
 * into the same one-off cube map and costs nothing per frame.
 */
function GradientDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color("#14141a") },
          bottom: { value: new THREE.Color("#030304") },
          band: { value: new THREE.Color("#eef2ff") },
          warm: { value: new THREE.Color("#c8a468") },
        },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vDir = normalize(world.xyz);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          uniform vec3 top;
          uniform vec3 bottom;
          uniform vec3 band;
          uniform vec3 warm;
          varying vec3 vDir;

          void main() {
            float h = vDir.y;
            vec3 col = mix(bottom, top, smoothstep(-0.25, 0.6, h));

            // Main cyclorama strip. Narrow and bright: glossy dark paint is a
            // dark base carrying a thin brilliant streak, and a wide dim source
            // just raises the whole panel to matte grey.
            //
            // Written as t*t rather than pow(t, 2.0) — t goes negative below
            // the band's centre, and pow() with a negative base is undefined
            // in GLSL.
            float t = (h + 0.05) / 0.055;
            float core = exp(-t * t);

            // Azimuthal shaping so the streak has ends instead of ringing the
            // subject evenly — a perfectly uniform ring reads as a painted-on
            // line rather than a reflection of something.
            float az = 0.45 + 0.55 * abs(vDir.z);
            col += band * core * 1.25 * az;

            // Warm kicker on the opposite side, carrying the brand gold into
            // the reflection rather than only into the direct lights.
            float g = (h + 0.02) / 0.11;
            col += warm * exp(-g * g) * 0.55 * smoothstep(0.0, 0.7, -vDir.x);

            // Soft shoulder band for the upper bodyside and roof radius.
            float s = (h - 0.32) / 0.17;
            col += band * exp(-s * s) * 0.22;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} scale={100}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    SCENE                                    */
/* -------------------------------------------------------------------------- */

export default function CoachScene({
  autoRotate = 0.055,
  depthField = true,
  scrollInfluence = 0.8,
  pointerInfluence = 0.1,
  floatAmplitude = 0.04,
  quality: qualityOverride,
  className,
}: CoachSceneProps) {
  // Probed once on mount; the probe touches the DOM so it can't run on server.
  const [quality, setQuality] = useState<QualitySettings | null>(qualityOverride ?? null);

  useEffect(() => {
    if (qualityOverride) return;
    setQuality(detectQuality());
  }, [qualityOverride]);

  if (!quality) return null;

  return (
    <Canvas
      shadows={quality.shadows}
      dpr={quality.dpr}
      gl={{
        antialias: !quality.postProcessing, // the composer does its own AA pass
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      // Long lens (20° fov) from a three-quarter front angle: compresses the
      // body the way automotive photography does, instead of the wide-angle
      // bulge you get from a default 50° camera. CameraRig solves the actual
      // position from the canvas aspect, so a longer lens simply pushes the
      // camera further back at the same framing — which is exactly the trade
      // that flattens the perspective on a subject this long.
      camera={{ fov: 20, near: 0.5, far: 200 }}
      className={className ?? "!touch-pan-y"}
    >
      <CameraRig />

      <Suspense fallback={null}>
        <StudioLighting quality={quality} />

        {depthField && quality.tier === "high" && <DepthField />}

        <group>
          <CoachRig
            autoRotate={autoRotate}
            scrollInfluence={scrollInfluence}
            pointerInfluence={pointerInfluence}
            floatAmplitude={floatAmplitude}
            detail={quality.tier === "high" ? "high" : "low"}
          />

          {/* Grounds the vehicle without rendering a floor plane. A real
              reflective floor was tried and cut: it read as a hard-edged grey
              stage rather than asphalt, and its per-frame blur was the single
              most expensive thing in the scene. */}
          <ContactShadows
            position={[0, 0.015, 0]}
            opacity={0.8}
            scale={26}
            blur={2.4}
            far={5}
            resolution={quality.contactShadowResolution}
            color="#000000"
          />
        </group>

        {quality.postProcessing && (
          <EffectComposer multisampling={4}>
            {/* Threshold sits above the paint so only the lamps and the
                brightest strip reflections bloom — a low threshold here is
                what makes 3D scenes look hazy and cheap. */}
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.75}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
            <Vignette offset={0.32} darkness={0.72} eskil={false} />
          </EffectComposer>
        )}

        <Preload all />
      </Suspense>

      {/* Drops resolution while the user is actively scrolling, then restores
          it once things settle. */}
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </Canvas>
  );
}
