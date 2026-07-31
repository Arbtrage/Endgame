import { useRef, useMemo } from "react";
import { DoubleSide } from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type { Points } from "three";

function DustParticles({ count = 50 }: { count?: number }) {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const seed = (i * 9301 + 49297) % 233280;
      const r1 = seed / 233280;
      const r2 = ((seed * 7) % 233280) / 233280;
      const r3 = ((seed * 13) % 233280) / 233280;
      const radius = 10 + r1 * 8;
      const angle = r2 * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = r3 * 10 - 1;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#86efac"
        transparent
        opacity={0.12}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GradientSky() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial color="#0c0c14" side={DoubleSide} />
    </mesh>
  );
}

export function SceneBackground({ particleCount = 50 }: { particleCount?: number }) {
  return (
    <>
      <color attach="background" args={["#08080e"]} />
      <fog attach="fog" args={["#08080e", 28, 65]} />
      <GradientSky />
      <Stars
        radius={70}
        depth={40}
        count={400}
        factor={2}
        saturation={0.15}
        fade
        speed={0.2}
      />
      <DustParticles count={particleCount} />
    </>
  );
}
