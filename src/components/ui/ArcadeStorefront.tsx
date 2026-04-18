import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface ArcadeStorefrontProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export const ArcadeStorefront: React.FC<ArcadeStorefrontProps> = ({
  position = [0, 0, -20],
  scale = 10,
  rotation = [0, Math.PI, 0]
}) => {
  const debugParams = useGameStore((state) => state.debugParams);
  
  // Load the new storefront model
  const { scene } = useGLTF('/assets/glbs/Game_Over_Storefront.glb');
  
  const storefrontRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (storefrontRef.current && scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.roughness = 0.5;
            material.metalness = 0.5;
            material.envMapIntensity = 2.0; // Higher pop for neon
            material.fog = true; // Ensure model reacts to fog sliders
          }
        }
      });
    }
  }, [scene]);

  return (
    <group
      ref={storefrontRef}
      position={[
        (debugParams.storefrontPositionX ?? 0) + position[0],
        (debugParams.storefrontPositionY ?? 0) + position[1], 
        (debugParams.storefrontPositionZ ?? 0) + position[2]
      ]}
      scale={[
        (debugParams.storefrontScale ?? 1) * scale,
        (debugParams.storefrontScale ?? 1) * scale,
        (debugParams.storefrontScale ?? 1) * scale
      ]}
      rotation={[
        (debugParams.storefrontRotationX ?? 0),
        (debugParams.storefrontRotationY ?? 0) + rotation[1],
        (debugParams.storefrontRotationZ ?? 0)
      ]}
    >
      {scene && <primitive object={scene.clone()} />}
    </group>
  );
};
