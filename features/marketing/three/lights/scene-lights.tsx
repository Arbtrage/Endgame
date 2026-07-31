import { Environment, Lightformer, ContactShadows } from "@react-three/drei";

export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 14, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
        shadow-normalBias={0.15}
      />
      <directionalLight position={[-5, 4, -4]} intensity={0.25} color="#c8d8ff" />
      <spotLight
        position={[0, 10, 2]}
        angle={0.5}
        penumbra={0.6}
        intensity={0.3}
        color="#fff5e6"
        castShadow={false}
      />
      {/* Procedural environment: no network HDR fetch, smooth studio-like
          reflections (sharp HDRI features were reflecting onto the board). */}
      <Environment resolution={256} environmentIntensity={0.5}>
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[0, 8, -4]}
          rotation={[-Math.PI / 2.5, 0, 0]}
          scale={[10, 6, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-7, 3, 2]}
          rotation={[0, Math.PI / 2.6, 0]}
          scale={[6, 4, 1]}
          color="#dbe6ff"
        />
        <Lightformer
          form="rect"
          intensity={1}
          position={[7, 3, -2]}
          rotation={[0, -Math.PI / 2.6, 0]}
          scale={[6, 4, 1]}
          color="#fff1dd"
        />
      </Environment>
      <ContactShadows
        position={[0, -0.45, 0]}
        opacity={0.35}
        scale={14}
        blur={1.5}
        far={6}
      />
    </>
  );
}
