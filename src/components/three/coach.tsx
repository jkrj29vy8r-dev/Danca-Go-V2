"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * The coach is built from primitives rather than a GLB.
 *
 * Rationale: a photoreal 12m coach model is a 15–40MB download that would
 * dominate LCP on the hero. A procedural body made of rounded boxes and one
 * extruded profile ships as a few KB of JS, renders identically on every
 * device, and — with clearcoat paint and lightformer reflections — reads as a
 * premium studio render. Swap in a GLB later via `useGLTF` without touching
 * the scene rig.
 *
 * Units are metres: 12m long, 2.55m wide, ~4.1m to the top of the roof pod —
 * a real touring coach.
 *
 * THE LIVERY IS THE BRAND. Deep near-black paint carrying a gold beltline that
 * kicks up over the rear axle, with a bright sill trim underneath. That is a
 * real high-end coach livery, and it happens to be exactly the Danca Go
 * palette, so the vehicle reads as *ours* rather than as generic stock 3D.
 *
 * WHAT MAKES IT READ AS A COACH, in priority order at hero framing (the body
 * is a few hundred pixels wide, so silhouette beats surface detail every
 * time):
 *   1. The dark mask — glazing and windscreen as one continuous black form
 *      wrapping the nose. This is *the* defining feature of a touring coach;
 *      without it a body shell is a shipping container with windows.
 *   2. Wheels visibly clear of the bodyside, in dark arch recesses
 *   3. Front and rear overhangs with bumpers, so the ends aren't slab-cut
 *   4. A crowned roof that falls toward the windscreen
 * Micro-detail (spokes, panel seams, bay doors) is gated to the `high` tier:
 * it costs draw calls and is sub-pixel on a phone.
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
 * leaving only a bright crescent of hub poking out and reading as a scoop
 * rather than a wheel.
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

/**
 * Key heights, in metres above the ground plane. Worth stating explicitly
 * because they have to stack correctly and several are easy to get subtly
 * wrong: the previous pass had the glazing band topping out at 4.10 and the
 * windscreen at 4.25 while the roof was at 3.72, so both were poking through
 * the roof panel and reading as a dark seam along the top of the vehicle.
 *
 *   0.62  bodyside begins (above it, the skirt)
 *   1.95  gold beltline
 *   2.57  glazing band begins
 *   3.47  glazing band ends
 *   3.72  roof — everything above must be crown, cowling or aerial
 */
const bodyCentreY = BODY_HEIGHT / 2 + 0.62; // 2.17
const roofY = BODY_HEIGHT + 0.62; // 3.72
/** Centre of the glazing band. Its half-height is `MASK_HALF_HEIGHT`. */
const glazingY = bodyCentreY + 0.85; // 3.02
const MASK_HALF_HEIGHT = 0.45;
/** The gold livery runs across the lower bodyside, clear of the windows. */
const LIVERY_Y = 1.95;

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
     *  - a base that is *near* black but never pure, so the form stays readable
     *  - very low roughness under a full clearcoat, which gives the two-lobe
     *    highlight real car paint has (sharp coat + soft basecoat)
     *  - high envMapIntensity so the studio strips wrap around the body
     *
     * The reference this is cut from is a black touring coach photographed at
     * dusk: the paint is dark enough to read as black, yet the whole sky is
     * legible in the flank. That only happens at low roughness with a strong
     * environment — a matte dark grey would swallow it.
     */
    const paint = new THREE.MeshPhysicalMaterial({
      // Charcoal rather than true black. The glazing is near-black by
      // necessity (it is a mirror), so painting the body black too collapses
      // the two into one glossy mass and the window band — the feature that
      // makes the shape read as a coach — disappears. On the reference coach
      // that contrast comes from the livery; here it has to come from value.
      color: "#1b1b22",
      // Real automotive paint is a *dielectric* basecoat with suspended
      // flake, not a metal. Modelling it at high metalness meant the body
      // took nearly all its colour from the environment map — so anywhere
      // the studio strips didn't reach, it collapsed to black and the coach
      // read as a shipping container.
      metalness: 0.12,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.028,
      envMapIntensity: 3.4,
      sheen: 0.35,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color("#2b2b3a"),
    });

    /**
     * Deep, near-mirror glazing with a faint blue cast — plus a low emissive.
     *
     * The emissive is not decoration. At high metalness a material has almost
     * no diffuse response, so the glazing band shows *only* what it reflects:
     * on a black page, between the lightformer strips, that meant nothing. The
     * continuous window line is the single feature that says "coach" rather
     * than "dark box", and it was disappearing for most of every rotation.
     *
     * Kept well under the bloom threshold so the windows glow rather than
     * flare, and low in absolute terms because the glazing is a large surface
     * — pushed too far it stops reading as glass and turns the upper half of
     * the vehicle navy.
     */
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#05070d",
      metalness: 1,
      roughness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.6,
      emissive: new THREE.Color("#101a2e"),
      emissiveIntensity: 0.3,
    });

    // Polished brass, not flat yellow: high metalness, low roughness, and the
    // colour carried by reflection rather than emission.
    const gold = new THREE.MeshStandardMaterial({
      color: "#c8a468",
      metalness: 1,
      roughness: 0.14,
      envMapIntensity: 3.2,
    });

    /** Bright sill trim. Chrome is what stops a black flank reading flat. */
    const chrome = new THREE.MeshStandardMaterial({
      color: "#c8ccd4",
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 3,
    });

    const trim = new THREE.MeshStandardMaterial({
      color: "#0c0c10",
      metalness: 0.7,
      roughness: 0.4,
      envMapIntensity: 1.3,
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
      roughness: 0.26,
      envMapIntensity: 1.4,
    });

    // Tone-mapped and restrained: unmapped emissives at high intensity clip to
    // flat white blobs that read as rendering artefacts, not lamps.
    const headlight = new THREE.MeshStandardMaterial({
      color: "#dce6f5",
      emissive: new THREE.Color("#cfe0ff"),
      emissiveIntensity: 1.5,
      roughness: 0.18,
      metalness: 0.3,
    });

    const taillight = new THREE.MeshStandardMaterial({
      color: "#7d1717",
      emissive: new THREE.Color("#e02424"),
      emissiveIntensity: 1,
      roughness: 0.3,
    });

    return { paint, glass, gold, chrome, trim, recess, rubber, rim, headlight, taillight };
  }, []);

  /**
   * The dark mask, as one extruded profile per side.
   *
   * On a real touring coach the glazing is not a rectangle — the black area
   * deepens toward the front, sweeping down to meet the windscreen so the
   * whole nose reads as one dark form. A box cannot do that, and the box
   * version was the main reason the silhouette read as generic.
   *
   * Extruding a `THREE.Shape` costs one geometry built once at mount, which is
   * far cheaper than the alternative of many small meshes faking the taper.
   */
  const maskGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const front = BODY_LENGTH / 2 - 0.35;
    const rear = -BODY_LENGTH / 2 + 0.55;
    const top = MASK_HALF_HEIGHT;
    const bottom = -MASK_HALF_HEIGHT;

    // Lower edge: level along the cabin, then dropping as it runs forward into
    // the windscreen surround.
    shape.moveTo(rear, bottom);
    shape.lineTo(rear, top);
    shape.lineTo(front - 1.5, top);
    // Round the top front corner into the windscreen
    shape.quadraticCurveTo(front, top, front, top - 0.5);
    shape.lineTo(front, bottom - 0.72);
    // Sweep the lower edge back up toward the cabin
    shape.quadraticCurveTo(front - 1.35, bottom - 0.3, front - 2.3, bottom);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.04,
      bevelSegments: 2,
      curveSegments: 10,
    });
    // Extrude builds along +Z from the shape plane; centre it so the two
    // sides can be mirrored around the body's own centreline.
    geometry.translate(0, 0, -0.025);
    return geometry;
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

      {/* --- Roof fall: a wedge over the nose so the roofline drops into the
              windscreen instead of ending in a square corner. --- */}
      <RoundedBox
        args={[1.9, 0.3, BODY_WIDTH - 0.42]}
        radius={0.14}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 1.05, roofY - 0.02, 0]}
        rotation={[0, 0, -0.11]}
        material={materials.paint}
        castShadow
      />

      {/* --- Skirt: the lower body panel.
              This is *painted*, not trim. It was near-black `trim` for several
              passes, and against a dark page that made it disappear entirely:
              the elevation showed a body shell hovering with four detached
              wheels below it and a band of nothing in between. On a real coach
              the lower panel is bodywork carrying the same paint, and only the
              arch cut-outs are dark.

              It stays inset from the wheel track so the tyres still read; a
              skirt as wide as the body swallows them whole. --- */}
      <RoundedBox
        args={[BODY_LENGTH - 0.5, 0.78, SKIRT_WIDTH]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.66, 0]}
        material={materials.paint}
        castShadow
      />

      {/* --- Bright sill trim, right along the bottom of the bodyside. On the
              reference coach this is the line that separates the paint from
              the shadow under the vehicle; without it a black flank runs
              straight into a black floor. --- */}
      {[SKIRT_WIDTH / 2 + 0.02, -SKIRT_WIDTH / 2 - 0.02].map((z) => (
        <mesh key={`sill-${z}`} position={[0, 1.03, z]} material={materials.chrome}>
          <boxGeometry args={[BODY_LENGTH - 0.9, 0.045, 0.02]} />
        </mesh>
      ))}

      {/* --- Luggage bay doors: two long inset panels per side. Cheap, and the
              horizontal break stops the skirt reading as a solid plinth. --- */}
      {detail === "high" &&
        [SKIRT_WIDTH / 2 + 0.012, -SKIRT_WIDTH / 2 - 0.012].map((z) =>
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

      {/* --- The dark mask: glazing band and windscreen surround as one form,
              deepening toward the nose. See `maskGeometry`. --- */}
      {[HALF_WIDTH + 0.012, -HALF_WIDTH - 0.012].map((z) => (
        <mesh
          key={`mask-${z}`}
          geometry={maskGeometry}
          material={materials.glass}
          position={[0, glazingY, z]}
        />
      ))}

      {/* --- Window pillars --- */}
      {pillars.map((x) =>
        [HALF_WIDTH + 0.05, -HALF_WIDTH - 0.05].map((z) => (
          <mesh key={`pillar-${x}-${z}`} position={[x, glazingY, z]} material={materials.trim}>
            <boxGeometry args={[0.07, MASK_HALF_HEIGHT * 2 - 0.06, 0.02]} />
          </mesh>
        )),
      )}

      {/* --- Windscreen: deeply raked, wrapping the front.
              The rake is +Z, which leans the *top* backward. A negative angle
              here (as an earlier pass had) tips the top forward instead, which
              reads as a 1970s city bus rather than a touring coach.

              Set back far enough that the rake does not throw its lower edge
              past the bodywork. Rotating a 2.1m-tall box by 0.2rad swings its
              bottom corner forward by ~0.21m, and at the previous position
              that put a lip 0.4m proud of the nose — which reads as a
              protruding chin rather than a windscreen. --- */}
      <RoundedBox
        args={[1.4, 2.05, BODY_WIDTH - 0.05]}
        radius={0.26}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 1.0, 2.6, 0]}
        rotation={[0, 0, 0.2]}
        material={materials.glass}
      />

      {/* --- Rear window --- */}
      <RoundedBox
        args={[0.5, 1.0, BODY_WIDTH - 0.5]}
        radius={0.16}
        smoothness={4}
        position={[-BODY_LENGTH / 2 + 0.16, 3.05, 0]}
        material={materials.glass}
      />

      {/* --- Gold livery: one clean line the full length of the flank, with a
              thin companion below it.
              A first pass added an angled riser kicking up over the rear axle,
              copying the swoosh on the reference coach. At hero scale that
              reads as three disconnected scratches rather than a livery — the
              swoosh only works at photographic resolution. One confident line
              is the version that survives being 400px wide. --- */}
      {[HALF_WIDTH + 0.008, -HALF_WIDTH - 0.008].map((z) => (
        <group key={`livery-${z}`} position={[0, 0, z]}>
          <mesh position={[0.15, LIVERY_Y, 0]} material={materials.gold}>
            <boxGeometry args={[BODY_LENGTH - 1.9, 0.05, 0.014]} />
          </mesh>
          <mesh position={[0.15, LIVERY_Y - 0.17, 0]} material={materials.gold}>
            <boxGeometry args={[BODY_LENGTH - 2.6, 0.018, 0.012]} />
          </mesh>
        </group>
      ))}

      {/* --- Front bumper and lower valance: stops the nose reading slab-cut --- */}
      <RoundedBox
        args={[0.62, 0.7, BODY_WIDTH - 0.04]}
        radius={0.18}
        smoothness={4}
        position={[BODY_LENGTH / 2 - 0.02, 0.74, 0]}
        material={materials.trim}
        castShadow
      />
      <mesh position={[BODY_LENGTH / 2 + 0.2, 1.2, 0]} material={materials.recess}>
        <boxGeometry args={[0.06, 0.26, BODY_WIDTH - 0.5]} />
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
      {[HALF_WIDTH - 0.44, -HALF_WIDTH + 0.44].map((z) => (
        <mesh
          key={`head-${z}`}
          position={[BODY_LENGTH / 2 + 0.2, 0.84, z]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.headlight}
        >
          <capsuleGeometry args={[0.07, 0.42, 4, 12]} />
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
              These were once at `bodyCentreY + 1.85`, which put their tops at
              4.27m — half a metre *above* the 3.72m roofline. They were the
              tallest thing on the vehicle, which is both wrong and expensive:
              the camera fit solves against the overall height, so two small
              stalks were pushing the whole coach further away. --- */}
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
