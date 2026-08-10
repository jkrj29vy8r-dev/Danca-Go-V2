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
import { Coach } from "./coach";
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

/** Where the camera looks: roughly the middle of the coach's flank. */
const TARGET = new THREE.Vector3(0, 1.7, 0);

/**
 * Viewing direction — a three-quarter front angle, only ~7° above the
 * beltline. Near eye-level is what makes a vehicle read as heroic; looking
 * down on the roof makes it read as a toy.
 */
const DIRECTION = new THREE.Vector3(0.78, 0.13, 0.61).normalize();

/** The coach's footprint plus breathing room, in metres. */
const FRAME_WIDTH = 16.5;
const FRAME_HEIGHT = 6.6;

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
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);

    const distanceForHeight = FRAME_HEIGHT / (2 * halfFov);
    const distanceForWidth = FRAME_WIDTH / (2 * halfFov * aspect);
    const distance = THREE.MathUtils.clamp(
      Math.max(distanceForHeight, distanceForWidth),
      11,
      40,
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
}: Required<Pick<
  CoachSceneProps,
  "autoRotate" | "scrollInfluence" | "pointerInfluence" | "floatAmplitude"
>>) {
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
        <Coach hovered={hovered} />
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
      <ambientLight intensity={0.7} />

      {/* Key light, camera-left and high */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={2.4}
        castShadow={quality.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Gold rim along the top edge — the brand colour reading as light */}
      <directionalLight position={[-10, 6, -6]} intensity={1.8} color="#c8a468" />

      {/* Cool fill from below-front, keeps the shadows from going muddy */}
      <directionalLight position={[4, -2, 10]} intensity={0.55} color="#6f8cff" />

      {/* `frames={1}` bakes the cube map once — the rig is static, so there's
          no reason to re-render it every frame. */}
      <Environment resolution={quality.envResolution} frames={1}>
        <GradientDome />

        {/* Large soft overhead softbox */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 8, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 8, 1]}
        />

        {/* Flank strips — the "is this metal or plastic" decider */}
        <Lightformer form="rect" intensity={6} position={[0, 4.2, 9]} scale={[22, 0.7, 1]} />
        <Lightformer form="rect" intensity={3.6} position={[0, 1.6, 9]} scale={[22, 0.35, 1]} />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 3, -9]}
          rotation={[0, Math.PI, 0]}
          scale={[22, 1.2, 1]}
        />

        {/* Wraps the nose and front quarter, which the flank strips miss */}
        <Lightformer
          form="rect"
          intensity={4}
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
 * Graded dome for the *environment map only*.
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
        },
        vertexShader: `
          varying float vH;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vH = normalize(world.xyz).y;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          uniform vec3 top;
          uniform vec3 bottom;
          varying float vH;
          void main() {
            gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.25, 0.6, vH)), 1.0);
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
      // Long lens (24° fov) from a three-quarter front angle: compresses the
      // body the way automotive photography does, instead of the wide-angle
      // bulge you get from a default 50° camera. CameraRig solves the actual
      // position from the canvas aspect.
      camera={{ fov: 24, near: 0.5, far: 160 }}
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
