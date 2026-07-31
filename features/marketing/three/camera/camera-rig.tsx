"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Vector3 } from "three";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

const BASE_POSITION = new Vector3(0, 9, 16);
const BASE_LOOK_AT = new Vector3(0, 0.3, 0);
const ORBIT_RADIUS = 16;
const sharedFocusOffset = { current: new Vector3() };

export function focusCameraOn(midpoint: Vector3) {
  gsap.to(sharedFocusOffset.current, {
    x: midpoint.x * 0.15,
    y: midpoint.y * 0.1,
    z: midpoint.z * 0.15,
    duration: 0.6,
    ease: "power2.out",
  });
}

export function resetCameraFocus() {
  gsap.to(sharedFocusOffset.current, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.8,
    ease: "power2.inOut",
  });
}

export function CameraRig() {
  const { camera } = useThree();
  const orbitAngle = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const mouse = useLandingSceneStore((s) => s.mouse);
  const scrollProgress = useLandingSceneStore((s) => s.scrollProgress);

  useFrame((state, delta) => {
    orbitAngle.current += delta * 0.04;

    parallax.current.x += (mouse.x * 0.8 - parallax.current.x) * 0.05;
    parallax.current.y += (mouse.y * 0.4 - parallax.current.y) * 0.05;

    const scrollY = scrollProgress * 3;
    const scrollZ = scrollProgress * 2;
    const radius = ORBIT_RADIUS;
    const angle = orbitAngle.current + parallax.current.x * 0.15;

    const x = Math.sin(angle) * radius + parallax.current.x;
    const y =
      BASE_POSITION.y +
      scrollY +
      parallax.current.y +
      Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    const z = Math.cos(angle) * radius + scrollZ;

    const focus = sharedFocusOffset.current;
    camera.position.set(x + focus.x, y + focus.y, z + focus.z);

    const lookAt = BASE_LOOK_AT.clone().add(focus.clone().multiplyScalar(0.3));
    camera.lookAt(lookAt);
  });

  return null;
}
