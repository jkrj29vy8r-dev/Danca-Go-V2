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
 * Units are metres: 12m long, 2.55m wide, ~3.7m tall — a real touring coach.
 *
 * WHAT MAKES IT READ AS A VEHICLE, in priority order at hero framing (the
 * coach occupies roughly half the canvas width, so silhouette beats surface
 * detail every time):
 *   1. Wheels that are actually visible below the body, in dark arch recesses
 *   2. A continuous glazing band — the defining line of a coach
 *   3. Front/rear overhangs with bumpers, so the ends aren't slab-cut
 *   4. A crowned roof rather than a flat lid
 * Micro-detail (spokes, panel seams) is gated to the `high` tier: it costs
 * draw calls and is sub-pixel on a phone.
 */

const BODY_LENGTH = 12;
const BODY_HEIGHT = 3.1;
const BODY_WIDTH = 2.55;
const HALF_WIDTH = BODY_WIDTH / 2;

const WHEEL_RADIUS = 0.52;
const WHEEL_WIDTH = 0.34;

/**
 * The skirt has to be meaningfully narrower than the wheel track or it
 * swallows the wheels whole — which is exactly what the first version did,
 * leaving only a bright crescent of hub poking out below and reading as a
 * scoop rather than a wheel.
 */
const SKIRT_WIDTH = BODY_WIDTH - 0.46;

/** Outer face of the tyre sits flush with the bodyside, as on a real coach. */
const WHEEL_Z = HALF_WIDTH - WHEEL_WIDTH / 2 - 0.02;

/**
 * Axle positions along X. The nose is at +X (windscreen, headlights), so the
 * single steer axle belongs there and the drive/tag tandem at the rear.
 *
 * The original layout had this exactly reversed — two axles bunched under the
 * front doors and one lonely wheel at the back — which reads as wrong from
 * the side even to someone who has never thought about axle counts.
 */
const AXLES = [
  BODY_LENGTH / 2 - 1.95, // steer, front
  -BODY_LENGTH / 2 + 3.35, // drive
  -BODY_LENGTH / 2 + 2.0, // tag, tandem with the drive axle
];

export type CoachDetail = "high" | "low";

export function Coach({
  hovered = false,
  detail = "high",
}: {
  hovered?: boolean;
  detail?: CoachDetail;
}) {
  const group = useRef<THREE.Group>(null);
  const wheels = useRef<(THREE.Group | null)[]>([]);

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
      color: "#1d1d25",
      // Real automotive paint is a *dielectric* basecoat with suspended
      // flake, not a metal. Modelling it at metalness 0.58 meant the body
      // took nearly all its colour from the environment map — so anywhere
      // the studio strips didn't reach, it collapsed to black and the coach
      // read as a shipping container. Low metalness under a full clearcoat
      // keeps the basecoat visible and still gives the two-lobe highlight.
      metalness: 0.16,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.4,
      sheen: 0.4,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#3b3b4a"),
    });

    /**
     * Deep, near-mirror glazing with a faint blue cast — plus a low emissive.
     *
     * The emissive is not decoration. At `metalness: 1` a material has no
     * diffuse response at all, so the glazing band showed *only* what it
     * reflected: on a black page, between the lightformer strips, that meant
     * nothing. The continuous window line is the single feature that says
     * "coach" rather than "dark box", and it was disappearing for most of
     * every turntable rotation.
     *
     * Emissive is added independently of metalness, so this floors the band at
     * a dim lit-interior blue — how a coach actually looks at dusk — while the
     * strips still slide across it. Kept well under the bloom threshold (0.75)
     * so the windows glow rather than flare.
     *
     * The intensity is low for a reason: the glazing is a solid volume slightly
     * proud of the bodyside, so it presents a large surface. At 0.85 it stopped
     * reading as windows and turned the entire upper half of the coach navy.
     */
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#05070d",
      metalness: 1,
      roughness: 0.035,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.4,
      emissive: new THREE.Color("#101a2e"),
      emissiveIntensity: 0.3,
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

    /** Arch recesses and shut lines: near-black, matte, catches almost nothing. */
    const recess = new THREE.MeshStandardMaterial({
      color: "#050507",
      metalness: 0.2,
      roughness: 0.95,
      envMapIntensity: 0.35,
    });

    // Real tyres are a dark charcoal, not black — pure black against a dark
    // ground plane makes the wheel vanish and the coach look like it floats.
    const rubber = new THREE.MeshStandardMaterial({
      color: "#1c1c20",
      metalness: 0.04,
      roughness: 0.85,
      envMapIntensity: 0.7,
    });

    /**
     * Polished alloy, deliberately restrained. At full brightness these catch
     * the environment strips hard and, once bloom is applied, read as glowing
     * slabs rather than wheels.
     */
    const rim = new THREE.MeshStandardMaterial({
      color: "#8a9099",
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.35,
    });

    // Tone-mapped and restrained: unmapped emissives at high intensity clip to
    // flat white blobs that read as rendering artefacts, not lamps.
    const headlight = new THREE.MeshStandardMaterial({
      color: "#dce6f5",
      emissive: new THREE.Color("#cfe0ff"),
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.3,
    });

    const taillight = new THREE.MeshStandardMaterial({
      color: "#7d1717",
      emissive: new THREE.Color("#e02424"),
      emissiveIntensity: 0.9,
      roughness: 0.3,
    });

    return { paint, glass, gold, trim, recess, rubber, rim, headlight, taillight };
  }, []);

  useFrame((state, delta) => {
    // Wheels idle-spin, faster on hover — sells "this thing moves".
    const speed = hovered ? 6 : 1.6;
    for (const wheel of wheels.current) {
      // Local Y, because the parent group's +90° X rotation has already
      // mapped local Y onto the world Z axle. Spinning any other axis makes
      // the wheel wobble like a dropped coin.
      if (wheel) wheel.rotation.y -= delta * speed;
    }

    // Barely-there float so the coach never feels like a static screenshot.
    // Biased upward: the tyres sit on y=0 and the contact-shadow plane sits
    // just above it, so anything dipping below gets sliced.
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.position.y = (0.5 + 0.5 * Math.sin(t * 0.55)) * 0.04;
    }
  });

  // Window pillars, drawn as thin dark ribs over the glazing band.
  const pillars = Array.from({ length: 7 }, (_, index) => -4.6 + index * 1.35);

  const bodyCentreY = BODY_HEIGHT / 2 + 0.62;
  const beltlineY = bodyCentreY + 0.66;
  const glazingY = bodyCentreY + 1.35;
  const roofY = BODY_HEIGHT + 0.62;

  return (
    <group ref={group} dispose={null}>
      {/* --- Main body shell --- */}
      <RoundedBox
        args={[BODY_LENGTH, BODY_HEIGHT, BODY_WIDTH]}
        radius={0.38}
        smoothness={5}
        position={[0, bodyCentreY, 0]}
        material={materials.paint}
        castShadow
        receiveShadow
      />

      {/* --- Roof crown: a slightly narrower, shorter cap so the roof reads as
              domed rather than as a flat lid on a box. --- */}
      <RoundedBox
        args={[BODY_LENGTH - 0.5, 0.34, BODY_WIDTH - 0.34]}
        radius={0.16}
        smoothness={4}
        position={[0, roofY + 0.04, 0]}
        material={materials.paint}
        castShadow
      />

      {/* --- Skirt: inset well inside the wheel track, so the wheels read --- */}
      <RoundedBox
        args={[BODY_LENGTH - 0.7, 0.66, SKIRT_WIDTH]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.72, 0]}
        material={materials.trim}
        castShadow
      />

      {/* --- Luggage bay doors: two long inset panels per side. Cheap, and the
              horizontal break stops the skirt reading as a solid plinth. --- */}
      {[SKIRT_WIDTH / 2 + 0.012, -SKIRT_WIDTH / 2 - 0.012].map((z) =>
        [-3.1, 1.15].map((x) => (
          <mesh key={`bay-${x}-${z}`} position={[x, 0.72, z]} material={materials.recess}>
            <boxGeometry args={[3.1, 0.44, 0.014]} />
          </mesh>
        )),
      )}

      {/* --- Wheel arch lips: a half-ring hugging the top of each wheel.
              An earlier attempt used flat plates on the bodyside instead;
              they sat *in front of* the tyres and hid the very wheels they
              were meant to frame. A torus arc traces the opening without
              occluding anything behind it. --- */}
      {detail === "high" &&
        AXLES.map((x) =>
          [WHEEL_Z + 0.02, -WHEEL_Z - 0.02].map((z) => (
            // No rotation: a torus already lies in the XY plane with its hole
            // facing ±Z, which is exactly a wheel arch seen from the side.
            // Rotating it onto the horizontal (as a first pass did) turns the
            // arch into a collar encircling the tyre like a Saturn ring.
            // `arc: PI` keeps the upper half only.
            <mesh
              key={`arch-${x}-${z}`}
              position={[x, WHEEL_RADIUS, z]}
              material={materials.recess}
            >
              <torusGeometry args={[WHEEL_RADIUS * 1.14, 0.06, 6, 20, Math.PI]} />
            </mesh>
          )),
        )}

      {/* --- Glazing: one continuous dark band, the defining line of a coach --- */}
      <RoundedBox
        args={[BODY_LENGTH - 1.05, 1.15, BODY_WIDTH + 0.035]}
        radius={0.22}
        smoothness={4}
        position={[-0.15, glazingY, 0]}
        material={materials.glass}
      />

      {/* --- Window pillars --- */}
      {pillars.map((x) =>
        [HALF_WIDTH + 0.03, -HALF_WIDTH - 0.03].map((z) => (
          <mesh key={`pillar-${x}-${z}`} position={[x, glazingY, z]} material={materials.trim}>
            <boxGeometry args={[0.07, 1.16, 0.02]} />
          </mesh>
        )),
      )}

      {/* --- Windscreen: raked, wraps the front --- */}
      <RoundedBox
        args={[1.5, 1.85, BODY_WIDTH - 0.06]}
        radius={0.24}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 0.62, bodyCentreY + 1.12, 0]}
        rotation={[0, 0, -0.14]}
        material={materials.glass}
      />

      {/* --- Rear window --- */}
      <RoundedBox
        args={[0.5, 1.1, BODY_WIDTH - 0.5]}
        radius={0.16}
        smoothness={4}
        position={[-BODY_LENGTH / 2 + 0.16, bodyCentreY + 1.2, 0]}
        material={materials.glass}
      />

      {/* --- Gold beltline: the single brand accent on the vehicle --- */}
      {[HALF_WIDTH + 0.008, -HALF_WIDTH - 0.008].map((z) => (
        <mesh key={`belt-${z}`} position={[-0.15, beltlineY, z]} material={materials.gold}>
          <boxGeometry args={[BODY_LENGTH - 1.4, 0.05, 0.014]} />
        </mesh>
      ))}

      {/* --- Front bumper and lower valance: stops the nose reading slab-cut --- */}
      <RoundedBox
        args={[0.52, 0.62, BODY_WIDTH - 0.06]}
        radius={0.16}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 0.06, 0.78, 0]}
        material={materials.trim}
        castShadow
      />
      <mesh position={[BODY_LENGTH / 2 + 0.13, 1.24, 0]} material={materials.recess}>
        <boxGeometry args={[0.06, 0.24, BODY_WIDTH - 0.5]} />
      </mesh>

      {/* --- Rear bumper + engine bay grille --- */}
      <RoundedBox
        args={[0.4, 0.58, BODY_WIDTH - 0.1]}
        radius={0.14}
        smoothness={4}
        position={[-BODY_LENGTH / 2 + 0.04, 0.76, 0]}
        material={materials.trim}
        castShadow
      />
      <mesh position={[-BODY_LENGTH / 2 - 0.02, 1.5, 0]} material={materials.recess}>
        <boxGeometry args={[0.05, 0.5, BODY_WIDTH - 0.8]} />
      </mesh>

      {/* --- Roof cowling / AC unit --- */}
      <RoundedBox
        args={[4.2, 0.2, BODY_WIDTH - 0.9]}
        radius={0.08}
        smoothness={3}
        position={[-1.6, roofY + 0.28, 0]}
        material={materials.trim}
      />

      {/* --- Lighting: sits in the bumper, where a coach's lamps actually are --- */}
      {[HALF_WIDTH - 0.46, -HALF_WIDTH + 0.46].map((z) => (
        <mesh
          key={`head-${z}`}
          position={[BODY_LENGTH / 2 + 0.14, 0.86, z]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.headlight}
        >
          <capsuleGeometry args={[0.06, 0.36, 4, 12]} />
        </mesh>
      ))}

      {[HALF_WIDTH - 0.44, -HALF_WIDTH + 0.44].map((z) => (
        <mesh
          key={`tail-${z}`}
          position={[-BODY_LENGTH / 2 - 0.06, 0.94, z]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.taillight}
        >
          <capsuleGeometry args={[0.055, 0.32, 4, 12]} />
        </mesh>
      ))}

      {/* --- Mirrors, mounted at the top of the windscreen ---
              These were at `bodyCentreY + 1.85`, which put their tops at 4.27m
              — half a metre *above* the 3.72m roofline. They were the tallest
              thing on the vehicle, which is both wrong and expensive: the
              camera fit solves against the overall height, so two small stalks
              were pushing the whole coach further away. --- */}
      {[HALF_WIDTH + 0.16, -HALF_WIDTH - 0.16].map((z) => (
        <mesh
          key={`mirror-${z}`}
          position={[BODY_LENGTH / 2 - 1.05, bodyCentreY + 1.0, z]}
          material={materials.trim}
        >
          <boxGeometry args={[0.06, 0.5, 0.14]} />
        </mesh>
      ))}

      {/* --- Wheels --- */}
      {AXLES.flatMap((x, axleIndex) =>
        [WHEEL_Z, -WHEEL_Z].map((z, sideIndex) => (
          <Wheel
            key={`wheel-${axleIndex}-${sideIndex}`}
            position={[x, WHEEL_RADIUS, z]}
            materials={materials}
            detail={detail}
            spinRef={(node) => {
              wheels.current[axleIndex * 2 + sideIndex] = node;
            }}
          />
        )),
      )}
    </group>
  );
}

/**
 * One wheel: tyre, dished rim, and (on the `high` tier) spokes.
 *
 * The outer group's +90° X rotation puts the cylinder's own axis onto world Z
 * — across the vehicle. The inner group is what spins, about its local Y,
 * which that rotation has already aligned with the axle.
 */
function Wheel({
  position,
  materials,
  detail,
  spinRef,
}: {
  position: [number, number, number];
  materials: {
    rubber: THREE.Material;
    rim: THREE.Material;
    recess: THREE.Material;
  };
  detail: CoachDetail;
  spinRef: (node: THREE.Group | null) => void;
}) {
  const spokes = detail === "high" ? 6 : 0;

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={spinRef}>
        {/* Tyre */}
        <mesh material={materials.rubber} castShadow>
          <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 28]} />
        </mesh>

        {/* Rim face, proud of the tyre so it catches the flank strips */}
        <mesh position={[0, WHEEL_WIDTH / 2 - 0.01, 0]} material={materials.rim}>
          <cylinderGeometry args={[WHEEL_RADIUS * 0.62, WHEEL_RADIUS * 0.62, 0.05, 24]} />
        </mesh>

        {/* Dished centre — a flat rim face reads as a plastic disc */}
        <mesh position={[0, WHEEL_WIDTH / 2 - 0.05, 0]} material={materials.recess}>
          <cylinderGeometry args={[WHEEL_RADIUS * 0.42, WHEEL_RADIUS * 0.42, 0.06, 20]} />
        </mesh>

        <mesh position={[0, WHEEL_WIDTH / 2, 0]} material={materials.rim}>
          <cylinderGeometry args={[WHEEL_RADIUS * 0.16, WHEEL_RADIUS * 0.16, 0.05, 12]} />
        </mesh>

        {Array.from({ length: spokes }, (_, index) => {
          const angle = (index / spokes) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[
                Math.cos(angle) * WHEEL_RADIUS * 0.34,
                WHEEL_WIDTH / 2 - 0.02,
                Math.sin(angle) * WHEEL_RADIUS * 0.34,
              ]}
              rotation={[0, -angle, 0]}
              material={materials.rim}
            >
              <boxGeometry args={[WHEEL_RADIUS * 0.46, 0.045, 0.075]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
