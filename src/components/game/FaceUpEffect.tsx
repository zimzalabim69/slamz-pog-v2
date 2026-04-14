import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface FaceUpEffectProps {
  pogId: string;
  position: [number, number, number];
}

export function FaceUpEffect({ pogId, position }: FaceUpEffectProps) {
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Quality-aware visual effects
    if (qualityLevel === 'low') {
      // Subtle glow on low quality
      meshRef.current.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
    } else if (qualityLevel === 'medium') {
      // Moderate glow on medium quality
      meshRef.current.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
    } else {
      // Juicy effects on high quality (especially in Blacklight Basement)
      meshRef.current.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
    }
    
    // Auto-remove after 2 seconds
    const timeout = setTimeout(() => {
      if (meshRef.current && meshRef.current.parent) {
        meshRef.current.parent.remove(meshRef.current);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [pogId, qualityLevel]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
    </mesh>
  );
}
