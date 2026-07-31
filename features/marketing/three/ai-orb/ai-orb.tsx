"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

function OrbParticles() {
  const ref = useRef<Mesh>(null);
  const phase = useLandingSceneStore((s) => s.phase);

  useFrame((state) => {
    if (ref.current) {
      const speed = phase === "thinking" ? 1.8 : 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.55, 0.012, 8, 48]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={phase === "thinking" ? 0.8 : 0.25}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

export function AIOrb() {
  const meshRef = useRef<Mesh>(null);
  const phase = useLandingSceneStore((s) => s.phase);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pulse =
      phase === "thinking"
        ? 1 + Math.sin(t * 3) * 0.08
        : 1 + Math.sin(t * 1.2) * 0.03;
    meshRef.current.scale.setScalar(pulse);
    const mat = meshRef.current.material;
    if (mat && "emissiveIntensity" in mat) {
      mat.emissiveIntensity =
        phase === "thinking" ? 0.9 + Math.sin(t * 4) * 0.3 : 0.35;
    }
  });

  return (
    <group position={[7.5, 3.4, -4]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.35}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>
      <OrbParticles />
      {/* Tight falloff so the green glow never tints the board */}
      <pointLight
        color="#22c55e"
        intensity={phase === "thinking" ? 0.7 : 0.25}
        distance={2.5}
        decay={2}
      />
    </group>
  );
}
