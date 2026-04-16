/**
 * Mobile Camera Controller
 * Handles aspect ratio and camera positioning for mobile devices
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useMobileDetection } from '../hooks/useMobileDetection';
import * as THREE from 'three';

interface MobileCameraControllerProps {
  isMenuMode: boolean;
  isCharging?: boolean;
}

export const MobileCameraController = ({ isMenuMode, isCharging = false }: MobileCameraControllerProps) => {
  const { camera } = useThree();
  const mobileInfo = useMobileDetection();
  const vec = new THREE.Vector3();
  const chargingStartTime = useRef(0);

  // Adjust camera for mobile aspect ratios
  useEffect(() => {
    if (mobileInfo.isMobile || mobileInfo.isTouch) {
      if (mobileInfo.orientation === 'portrait') {
        // Portrait mode: adjust camera for vertical gameplay
        camera.position.set(0, 15, 8);
        camera.lookAt(0, 0, 0);
        
        // Adjust FOV for portrait
        if ('fov' in camera) {
          camera.fov = 75;
          camera.updateProjectionMatrix();
        }
      } else {
        // Landscape mode: optimized camera position
        camera.position.set(0, 10, 6);
        camera.lookAt(0, 0, 0);
        
        // Standard FOV for landscape
        if ('fov' in camera) {
          camera.fov = 50;
          camera.updateProjectionMatrix();
        }
      }
    }
  }, [mobileInfo, camera]);

  useFrame((state) => {
    if (mobileInfo.isMobile || mobileInfo.isTouch) {
      if (isMenuMode) {
        // Mobile cinematic orbit (closer than desktop)
        const t = state.clock.getElapsedTime() * 0.2;
        const radius = mobileInfo.orientation === 'portrait' ? 8 : 10;
        const height = mobileInfo.orientation === 'portrait' ? 10 : 7;
        
        state.camera.position.lerp(
          vec.set(Math.cos(t) * radius, height, Math.sin(t) * radius), 
          0.05
        );
        state.camera.lookAt(0, 0, 0);
        chargingStartTime.current = 0;
      } else if (isCharging) {
        // Mobile charging animation (more dramatic)
        if (chargingStartTime.current === 0) {
          chargingStartTime.current = state.clock.getElapsedTime();
        }
        
        const chargingElapsed = (state.clock.getElapsedTime() - chargingStartTime.current) * 1.5;
        const startHeight = mobileInfo.orientation === 'portrait' ? 15 : 10;
        const targetHeight = mobileInfo.orientation === 'portrait' ? 3 : 2;
        const diveHeight = startHeight - (chargingElapsed * (startHeight - targetHeight));
        
        const startRadius = mobileInfo.orientation === 'portrait' ? 8 : 10;
        const targetRadius = 0;
        const diveRadius = startRadius - (chargingElapsed * startRadius);
        
        const finalHeight = Math.max(diveHeight, targetHeight);
        const finalRadius = Math.max(diveRadius, targetRadius);
        
        state.camera.position.lerp(
          vec.set(
            Math.cos(chargingElapsed) * finalRadius, 
            finalHeight, 
            Math.sin(chargingElapsed) * finalRadius
          ), 
          0.2
        );
        state.camera.lookAt(0, 0, 0);
      } else {
        // Mobile gameplay position (optimized for touch)
        const targetHeight = mobileInfo.orientation === 'portrait' ? 12 : 10;
        const targetDistance = mobileInfo.orientation === 'portrait' ? 4 : 5;
        
        state.camera.position.lerp(
          vec.set(0, targetHeight, targetDistance), 
          0.15
        );
        state.camera.lookAt(0, 0, 0);
      }
    }
  });

  return null;
};
