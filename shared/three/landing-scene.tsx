"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import type { Mesh } from "three";

function FloatingPiece({
  position,
  color,
  rotationSpeed = 0.4,
}: {
  position: [number, number, number];
  color: string;
  rotationSpeed?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * rotationSpeed;
      ref.current.rotation.y += delta * rotationSpeed * 0.7;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export function LandingScene() {
  return (
    <>
      <color attach="background" args={["#0a0a0f"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 4]} intensity={1.2} />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.5} />
      <FloatingPiece position={[-2.2, 0.4, 0]} color="#22c55e" />
      <FloatingPiece position={[2.1, -0.2, -0.5]} color="#e5e7eb" rotationSpeed={0.25} />
      <FloatingPiece position={[0.2, 1.1, -1]} color="#86efac" rotationSpeed={0.35} />
    </>
  );
}
