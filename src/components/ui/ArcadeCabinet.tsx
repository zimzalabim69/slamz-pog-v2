import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface ArcadeCabinetProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  position = [0, 0, -5],
  scale = 1,
  rotation = [0, 0, 0]
}) => {
  const debugParams = useGameStore((state) => state.debugParams);
  
  // Load the arcade cabinet model
  const { scene } = useGLTF('/assets/Slamz_Pro_Tour_Arcade.glb');
  
  // Clone the scene to avoid shared state issues
  const cabinetRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (cabinetRef.current && scene) {
      // Apply materials and ensure proper rendering
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enhance materials for better visual quality
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.roughness = 0.7;
            material.metalness = 0.3;
            material.envMapIntensity = 1.0;
          }
        }
      });
    }
  }, [scene]);

  // Don't render if disabled
  if (!debugParams.arcadeCabinetVisible) {
    return null;
  }

  return (
    <group
      ref={cabinetRef}
      position={[
        debugParams.arcadeCabinetPositionX + position[0],
        debugParams.arcadeCabinetPositionY + position[1], 
        debugParams.arcadeCabinetPositionZ + position[2]
      ]}
      scale={[
        debugParams.arcadeCabinetScale * scale,
        debugParams.arcadeCabinetScale * scale,
        debugParams.arcadeCabinetScale * scale
      ]}
      rotation={[
        rotation[0],
        debugParams.arcadeCabinetRotationY + rotation[1],
        rotation[2]
      ]}
    >
      {scene && <primitive object={scene.clone()} />}
    </group>
  );
};
