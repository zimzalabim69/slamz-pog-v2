import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface CameraControllerProps {
  isMenuMode: boolean;
  isCharging?: boolean;
}

export const CameraController = ({ isMenuMode, isCharging = false }: CameraControllerProps) => {
  const vec = new THREE.Vector3();
  const chargingStartTime = useRef(0);

  useFrame((state) => {
    if (isMenuMode) {
      // Cinematic Orbit: Rotate around the center (0,0,0)
      const t = state.clock.getElapsedTime() * 0.3;
      state.camera.position.lerp(vec.set(Math.cos(t) * 10, 7, Math.sin(t) * 10), 0.05);
      state.camera.lookAt(0, 0, 0);
      chargingStartTime.current = 0; // Reset charging timer
    } else if (isCharging) {
      // Start charging timer if not started
      if (chargingStartTime.current === 0) {
        chargingStartTime.current = state.clock.getElapsedTime();
      }
      
      // CHARGING STATE: Camera "dives" into the table
      const chargingElapsed = (state.clock.getElapsedTime() - chargingStartTime.current) * 2;
      const diveHeight = 7 - (chargingElapsed * 3); // Descend from orbit height
      const diveRadius = 10 - (chargingElapsed * 5); // Spiral inward
      
      // Clamp values to prevent negative
      const finalHeight = Math.max(diveHeight, 2);
      const finalRadius = Math.max(diveRadius, 0);
      
      state.camera.position.lerp(
        vec.set(
          Math.cos(chargingElapsed) * finalRadius, 
          finalHeight, 
          Math.sin(chargingElapsed) * finalRadius
        ), 
        0.15
      );
      state.camera.lookAt(0, 0, 0);
    } else {
      // Gameplay Position: Smoothly lock to top-down view
      state.camera.position.lerp(vec.set(0, 12, 5), 0.1);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return null;
};
