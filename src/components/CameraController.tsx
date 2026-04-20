import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export function CameraController() {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.5, 0));

  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);

  useFrame(() => {
    // Locked arcade cabinet view - fixed position and angle
    const targetPosition = new THREE.Vector3(0, 8.5, 22); // Classic "looking down into the cabinet" angle

    // During bullet-time, pull back slightly for dramatic effect but stay locked
    if (isCinematicActive && bulletTimeActive) {
      targetPosition.set(0, 10, 26); // slight zoom out during eruption/abduction
    }

    // Smooth but limited movement (feels like a real fixed monitor)
    camera.position.lerp(targetPosition, 0.06);

    // Always look at the center of the play area
    lookAtTarget.current.lerp(new THREE.Vector3(0, 1, 0), 0.08);
    camera.lookAt(lookAtTarget.current);

    // Fixed FOV for that old CRT feel
    camera.fov = 52;
    camera.updateProjectionMatrix();
  });

  return null;
}
