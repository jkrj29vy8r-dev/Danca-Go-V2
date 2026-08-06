"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  Lightformer,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";
import { Coach } from "./coach";
import { clamp } from "@/lib/utils";

/**
 * Studio rig for the hero coach.
 *
 * Lighting is built from drei <Lightformer> panels inside a locally-rendered
 * <Environment> — no HDR file is fetched, so there's no external request, no
 * CSP exception and no multi-megabyte blocking download. The long horizontal
 * strips are what make the body read as painted metal: real automotive
 * photography works by reflecting softbox strips down the flank, and the
 * clearcoat material has nothing to reflect without them.
 */

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

/**
 * Frames the vehicle.
 *
 * Neither R3F's `camera` prop nor drei's <PerspectiveCamera> orients itself,
 * so without this the camera stares off down -Z. It also solves the camera
 * distance from the canvas aspect ratio, which is what keeps the coach fully
 * in frame on a wide desktop band and a narrow phone alike.
 */
function CameraTarget() {
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

/** Reads document scroll once per frame and eases the coach toward that pose. */
function CoachRig() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    // 0 → 1 across the first viewport of scrolling.
    const progress = clamp(window.scrollY / window.innerHeight, 0, 1);

    // The camera already sits ~39° off the nose, which is the three-quarter
    // view — so the rest pose is zero rotation. Scroll swings it toward a side
    // profile, and the pointer adds a small parallax nudge.
    const targetY = progress * 0.8 + pointer.x * 0.1;
    const targetX = 0.02 + progress * 0.06 - pointer.y * 0.04;

    // Frame-rate independent damping.
    const alpha = 1 - Math.pow(0.001, delta);
    node.rotation.y = THREE.MathUtils.lerp(node.rotation.y, targetY, alpha);
    node.rotation.x = THREE.MathUtils.lerp(node.rotation.x, targetX, alpha);
    node.position.z = THREE.MathUtils.lerp(node.position.z, progress * -2.2, alpha);
  });

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Coach hovered={hovered} />
    </group>
  );
}

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />

      {/* Key light, camera-left and high */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Gold rim along the top edge — the brand colour reading as light */}
      <directionalLight position={[-10, 6, -6]} intensity={1.8} color="#c8a468" />

      {/* Cool fill from below-front, keeps the shadows from going muddy */}
      <directionalLight position={[4, -2, 10]} intensity={0.55} color="#6f8cff" />

      {/*
        Locally rendered environment. `frames={1}` bakes it once — the scene
        lighting is static, so there's no reason to re-render the cube map.
      */}
      <Environment resolution={256} frames={1}>
        {/* Large soft overhead softbox */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 8, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 8, 1]}
        />

        {/* Long strip reflections running down the flank — the single most
            important cue that this is painted metal and not plastic. */}
        <Lightformer
          form="rect"
          intensity={6}
          position={[0, 4.2, 9]}
          scale={[22, 0.7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.6}
          position={[0, 1.6, 9]}
          scale={[22, 0.35, 1]}
        />
        {/* Wraps the nose and front quarter, which the flank strips miss */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[11, 3.4, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 1.6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 3, -9]}
          rotation={[0, Math.PI, 0]}
          scale={[22, 1.2, 1]}
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

export default function CoachScene() {
  return (
    <Canvas
      shadows
      // Cap DPR at 2: beyond that the fill-rate cost buys nothing visible.
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      // Long lens (24° fov) from a three-quarter front angle: compresses the
      // body the way automotive photography does, instead of the wide-angle
      // bulge you get from a default 50° camera. CameraTarget solves the
      // actual position from the canvas aspect.
      camera={{ fov: 24, near: 0.5, far: 140 }}
      className="!touch-pan-y"
    >
      <CameraTarget />

      <Suspense fallback={null}>
        <StudioLighting />

        <group>
          <CoachRig />

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
            resolution={512}
            color="#000000"
          />
        </group>

        <Preload all />
      </Suspense>

      {/* Drops resolution while the user is actively scrolling/interacting,
          then restores it once things settle. */}
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </Canvas>
  );
}
