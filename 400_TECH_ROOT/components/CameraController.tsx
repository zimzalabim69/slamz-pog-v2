import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';

export function CameraController() {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.5, 0));

  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);
  const perfectHitActive = useGameStore((s) => s.perfectHitActive);
  const impactFlashActive = useGameStore((s) => s.impactFlashActive);
  const currentFov = useRef(52);

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

    // FOV Punch Logic (AAAA Impact Feedback)
    if (perfectHitActive) {
      currentFov.current = 72; // Extreme punch for perfects
    } else if (impactFlashActive) {
      currentFov.current = 64; // Standard punch
    }

    currentFov.current = THREE.MathUtils.lerp(currentFov.current, 52, 0.1);

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = camera as THREE.PerspectiveCamera;
      if (Math.abs(pCam.fov - currentFov.current) > 0.01) {
        pCam.fov = currentFov.current;
        pCam.updateProjectionMatrix();
      }
    }
  });

  return null;
}
