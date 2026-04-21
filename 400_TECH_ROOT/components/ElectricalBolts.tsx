import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@100/store/useGameStore';
import { physicsFogBridge } from '@400/systems/PhysicsFogBridge';
import * as THREE from 'three';

export function ElectricalBolts() {
  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);
  const debugParams = useGameStore((s) => s.debugParams);
  
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

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

    // Trigger on cinematic OR high-energy impacts
    const energy = physicsFogBridge.energy;
    const active = (isCinematicActive && bulletTimeActive) || energy > 500;
    
    meshRef.current.visible = active;
    if (!active) return;

    // Update opacity based on energy
    const flickerBase = 0.4 + Math.random() * 0.6;
    const energyMult = Math.min(energy / 2000, 1.5);
    materialRef.current.opacity = flickerBase * energyMult;
    
    if (lightRef.current) {
      lightRef.current.intensity = 50 * energyMult * flickerBase;
    }

    // Source: Wraith's Arena Position (Fallback to center if debug params missing)
    const source = new THREE.Vector3(
      debugParams.wraithArenaPositionX ?? -26,
      debugParams.wraithArenaPositionY ?? 16.75,
      debugParams.wraithArenaPositionZ ?? 0.25
    );

    // Target: Random disturbance point if energy is high, otherwise center
    const target = energy > 500 && physicsFogBridge.disturbances[0]
      ? physicsFogBridge.disturbances[0].pos.clone().add(new THREE.Vector3(0, 1, 0))
      : new THREE.Vector3(0, 0.5, 0);

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
        ref={lightRef}
        intensity={20} 
        distance={10} 
        color="#00ffff" 
        position={[0, 5, 0]} 
      />
    </group>
  );
}
