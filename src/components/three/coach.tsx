"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * The coach is built from primitives rather than a GLB.
 *
 * Rationale: a photoreal 12m coach model is a 15–40MB download that would
 * dominate LCP on the hero. A procedural body made of rounded boxes ships as
 * a few KB of JS, renders identically on every device, and — with clearcoat
 * paint and lightformer reflections — reads as a premium studio render.
 * Swap in a GLB later via `useGLTF` without touching the scene rig.
 *
 * Units are metres: 12m long, 2.55m wide, 3.4m tall — a real touring coach.
 */

const BODY_LENGTH = 12;
const BODY_HEIGHT = 3.1;
const BODY_WIDTH = 2.55;
const WHEEL_RADIUS = 0.52;

export function Coach({ hovered = false }: { hovered?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group[]>([]);

  // Materials are memoised so hover/scroll re-renders never rebuild shaders.
  const materials = useMemo(() => {
    /**
     * Automotive paint, not plastic. Three things sell it:
     *  - a dark base that is *not* pure black, so the form stays readable
     *  - low roughness under a full clearcoat layer, which gives the two-lobe
     *    highlight real car paint has (sharp coat + soft basecoat)
     *  - high envMapIntensity so the lightformer strips wrap around the body
     */
    const paint = new THREE.MeshPhysicalMaterial({
      color: "#191920",
      metalness: 0.62,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 2.6,
      sheen: 0.3,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color("#2a2a36"),
    });

    // Deep, near-mirror glazing with a faint blue cast.
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#05070d",
      metalness: 1,
      roughness: 0.035,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.4,
    });

    // Polished brass, not flat yellow: high metalness, low roughness, and the
    // colour carried by reflection rather than emission.
    const gold = new THREE.MeshStandardMaterial({
      color: "#c8a468",
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 3,
    });

    const trim = new THREE.MeshStandardMaterial({
      color: "#0c0c10",
      metalness: 0.7,
      roughness: 0.42,
      envMapIntensity: 1.2,
    });

    const rubber = new THREE.MeshStandardMaterial({
      color: "#0b0b0d",
      metalness: 0.05,
      roughness: 0.92,
    });

    // Deliberately dim for polished alloy. At full brightness these catch the
    // environment strips hard and, once bloom is applied, read as glowing
    // slabs rather than wheels.
    const hub = new THREE.MeshStandardMaterial({
      color: "#5c6169",
      metalness: 1,
      roughness: 0.38,
      envMapIntensity: 1,
    });

    // Tone-mapped and restrained: unmapped emissives at high intensity clip to
    // flat white blobs that read as rendering artefacts, not lamps.
    const headlight = new THREE.MeshStandardMaterial({
      color: "#dce6f5",
      emissive: new THREE.Color("#cfe0ff"),
      emissiveIntensity: 1.1,
      roughness: 0.2,
      metalness: 0.3,
    });

    const taillight = new THREE.MeshStandardMaterial({
      color: "#7d1717",
      emissive: new THREE.Color("#e02424"),
      emissiveIntensity: 0.85,
      roughness: 0.3,
    });

    return { paint, glass, gold, trim, rubber, hub, headlight, taillight };
  }, []);

  useFrame((state, delta) => {
    // Wheels idle-spin, faster on hover — sells "this thing moves".
    const speed = hovered ? 6 : 1.6;
    for (const wheel of wheels.current) {
      if (wheel) wheel.rotation.x -= delta * speed;
    }

    // Barely-there float so the coach never feels like a static screenshot.
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.position.y = Math.sin(t * 0.55) * 0.04;
    }
  });

  const wheelPositions: [number, number, number][] = [
    [-BODY_LENGTH / 2 + 2.1, WHEEL_RADIUS, BODY_WIDTH / 2 - 0.12],
    [-BODY_LENGTH / 2 + 2.1, WHEEL_RADIUS, -BODY_WIDTH / 2 + 0.12],
    [BODY_LENGTH / 2 - 2.6, WHEEL_RADIUS, BODY_WIDTH / 2 - 0.12],
    [BODY_LENGTH / 2 - 2.6, WHEEL_RADIUS, -BODY_WIDTH / 2 + 0.12],
    [BODY_LENGTH / 2 - 1.25, WHEEL_RADIUS, BODY_WIDTH / 2 - 0.12],
    [BODY_LENGTH / 2 - 1.25, WHEEL_RADIUS, -BODY_WIDTH / 2 + 0.12],
  ];

  // Window pillars, drawn as thin dark ribs over the glazing band.
  const pillars = Array.from({ length: 7 }, (_, index) => -4.6 + index * 1.35);

  return (
    <group ref={group} dispose={null}>
      {/* --- Main body shell --- */}
      <RoundedBox
        args={[BODY_LENGTH, BODY_HEIGHT, BODY_WIDTH]}
        radius={0.38}
        smoothness={5}
        position={[0, BODY_HEIGHT / 2 + 0.62, 0]}
        material={materials.paint}
        castShadow
        receiveShadow
      />

      {/* --- Skirt below the body line, slightly inset --- */}
      <RoundedBox
        args={[BODY_LENGTH - 0.5, 0.72, BODY_WIDTH - 0.16]}
        radius={0.12}
        smoothness={4}
        position={[0, 0.66, 0]}
        material={materials.trim}
        castShadow
      />

      {/* --- Glazing: one continuous dark band, the defining line of a coach --- */}
      <RoundedBox
        args={[BODY_LENGTH - 1.05, 1.15, BODY_WIDTH + 0.035]}
        radius={0.22}
        smoothness={4}
        position={[-0.15, BODY_HEIGHT / 2 + 1.35, 0]}
        material={materials.glass}
      />

      {/* --- Window pillars --- */}
      {pillars.map((x) =>
        [BODY_WIDTH / 2 + 0.03, -BODY_WIDTH / 2 - 0.03].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, BODY_HEIGHT / 2 + 1.35, z]} material={materials.trim}>
            <boxGeometry args={[0.07, 1.16, 0.02]} />
          </mesh>
        )),
      )}

      {/* --- Windscreen: raked, wraps the front --- */}
      <RoundedBox
        args={[1.5, 1.85, BODY_WIDTH - 0.06]}
        radius={0.24}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 0.62, BODY_HEIGHT / 2 + 1.12, 0]}
        rotation={[0, 0, -0.14]}
        material={materials.glass}
      />

      {/* --- Rear window --- */}
      <RoundedBox
        args={[0.5, 1.1, BODY_WIDTH - 0.5]}
        radius={0.16}
        smoothness={4}
        position={[-BODY_LENGTH / 2 + 0.16, BODY_HEIGHT / 2 + 1.2, 0]}
        material={materials.glass}
      />

      {/* --- Gold beltline: the single brand accent on the vehicle --- */}
      {[BODY_WIDTH / 2 + 0.008, -BODY_WIDTH / 2 - 0.008].map((z) => (
        <mesh
          key={z}
          position={[-0.15, BODY_HEIGHT / 2 + 0.66, z]}
          material={materials.gold}
        >
          <boxGeometry args={[BODY_LENGTH - 1.4, 0.05, 0.014]} />
        </mesh>
      ))}

      {/* --- Roof cowling / AC unit --- */}
      <RoundedBox
        args={[4.2, 0.22, BODY_WIDTH - 0.7]}
        radius={0.09}
        smoothness={3}
        position={[-1.6, BODY_HEIGHT + 0.72, 0]}
        material={materials.trim}
      />

      {/* --- Lighting --- */}
      {[BODY_WIDTH / 2 - 0.42, -BODY_WIDTH / 2 + 0.42].map((z) => (
        <mesh
          key={`head-${z}`}
          position={[BODY_LENGTH / 2 - 0.04, 0.92, z]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.headlight}
        >
          <capsuleGeometry args={[0.055, 0.34, 4, 12]} />
        </mesh>
      ))}

      {[BODY_WIDTH / 2 - 0.4, -BODY_WIDTH / 2 + 0.4].map((z) => (
        <mesh
          key={`tail-${z}`}
          position={[-BODY_LENGTH / 2 + 0.02, 1.15, z]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.taillight}
        >
          <capsuleGeometry args={[0.05, 0.3, 4, 12]} />
        </mesh>
      ))}

      {/* --- Mirrors --- */}
      {[BODY_WIDTH / 2 + 0.16, -BODY_WIDTH / 2 - 0.16].map((z) => (
        <mesh
          key={`mirror-${z}`}
          position={[BODY_LENGTH / 2 - 1.05, BODY_HEIGHT / 2 + 1.85, z]}
          material={materials.trim}
        >
          <boxGeometry args={[0.06, 0.5, 0.14]} />
        </mesh>
      ))}

      {/* --- Wheels --- */}
      {wheelPositions.map((position, index) => (
        <group
          key={index}
          ref={(node) => {
            if (node) wheels.current[index] = node;
          }}
          position={position}
          rotation={[0, 0, Math.PI / 2]}
        >
          <mesh material={materials.rubber} castShadow>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 32]} />
          </mesh>
          <mesh
            position={[0, position[2] > 0 ? 0.075 : -0.075, 0]}
            material={materials.hub}
          >
            <cylinderGeometry args={[WHEEL_RADIUS * 0.56, WHEEL_RADIUS * 0.56, 0.17, 24]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
