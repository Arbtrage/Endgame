import { Float } from "@react-three/drei";

export function FloatingPlatform() {
  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.4}>
      <group position={[0, -0.35, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 5.6, 0.25, 64]} />
          <meshStandardMaterial
            color="#141418"
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[5.8, 5.8, 0.06, 64]} />
          <meshStandardMaterial
            color="#0a0a0f"
            metalness={0.5}
            roughness={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}
