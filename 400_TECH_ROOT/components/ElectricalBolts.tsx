import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@100/store/useGameStore';
import * as THREE from 'three';

export function ElectricalBolts() {
  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);
  const debugParams = useGameStore((s) => s.debugParams);
  
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Generate fractal lightning points
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      pts.push(new THREE.Vector3());
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const active = isCinematicActive && bulletTimeActive;
    meshRef.current.visible = active;

    if (!active) return;

    // Source: Wraith's Arena Position
    const source = new THREE.Vector3(
      debugParams.wraithArenaPositionX ?? -26,
      debugParams.wraithArenaPositionY ?? 16.75,
      debugParams.wraithArenaPositionZ ?? 0.25
    );

    // Target: Somewhere in the center of the mat or the slab
    const target = new THREE.Vector3(0, 0.5, 0);

    // Update curve points with jitter
    const t = state.clock.elapsedTime;
    for (let i = 0; i < points.length; i++) {
      const alpha = i / (points.length - 1);
      points[i].lerpVectors(source, target, alpha);
      
      if (i > 0 && i < points.length - 1) {
        points[i].x += (Math.random() - 0.5) * 2;
        points[i].y += (Math.random() - 0.5) * 2;
        points[i].z += (Math.random() - 0.5) * 2;
      }
    }

    // Flicker color (Cyan/Magenta)
    const color = Math.random() > 0.5 ? 0x00ffff : 0xff00ff;
    materialRef.current.color.setHex(color);
    materialRef.current.opacity = 0.5 + Math.random() * 0.5;
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
        <meshBasicMaterial 
          ref={materialRef} 
          transparent 
          opacity={0.8} 
          toneMapped={false}
        />
      </mesh>
      {/* Glow / Sprite pass would be nice, but simple tubes are high-performance AAAA */}
      <pointLight 
        intensity={20} 
        distance={10} 
        color="#00ffff" 
        position={[0, 5, 0]} 
      />
    </group>
  );
}
