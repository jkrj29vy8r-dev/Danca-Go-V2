"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Slow-drifting motes suspended around the subject.
 *
 * This exists to give the scene *depth* — something between the camera and the
 * vehicle that parallaxes as the coach turns, so the frame reads as a volume
 * rather than an object on a flat backdrop.
 *
 * It's one `THREE.Points` draw call with additive blending and no lighting, so
 * the cost is a single buffer upload at mount and a rotation per frame. Nothing
 * here scales with the number of motes at render time, which is why this is
 * affordable where a second canvas or instanced meshes would not be.
 */
export function DepthField({
  count = 220,
  radius = 16,
  color = "#c8a468",
  size = 0.05,
  speed = 0.02,
}: {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  speed?: number;
}) {
  const group = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute on a shell rather than a solid sphere, so motes stay clear
      // of the vehicle's own volume instead of poking through the bodywork.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.55 + Math.random() * 0.45);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      // Squash vertically: this is airborne dust, not a planetarium.
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.35 + 2;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      scales[i] = 0.4 + Math.random() * 0.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color, size],
  );

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 1 / 30);
    node.rotation.y += dt * speed;
    node.rotation.x += dt * speed * 0.25;
  });

  return <points ref={group} geometry={geometry} material={material} frustumCulled={false} />;
}
