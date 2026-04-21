import { RigidBody, CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@100/store/useGameStore';
import { useRef, useEffect, memo, useMemo, useState } from 'react';
import { getMaterialFromRegistry } from '@500/utils/TextureGenerator';
import { cinematicEngine } from '@400/systems/CinematicEngine';
import * as THREE from 'three';

// Procedural Fragment Geometry
const fragmentGeom = new THREE.TetrahedronGeometry(0.3);

interface ShardProps {
  position: [number, number, number];
  color: string;
}

const ShardFragment = ({ position, color }: ShardProps) => {
  const rb = useRef<RapierRigidBody>(null);
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    // Initial explosion impulse
    if (rb.current) {
      rb.current.applyImpulse({
        x: (Math.random() - 0.5) * 0.1,
        y: Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
      }, true);
    }
  }, []);

  useFrame((_, delta) => {
    if (opacity > 0) {
      setOpacity(prev => Math.max(0, prev - delta * 0.6));
    }
  });

  return (
    <RigidBody ref={rb} position={position} colliders="cuboid">
      <mesh geometry={fragmentGeom}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={4} 
          transparent 
          opacity={opacity} 
        />
      </mesh>
    </RigidBody>
  );
};

interface PogProps {
  id: string;
  theme: string;
  rarity: 'standard' | 'shiny' | 'holographic';
  position: [number, number, number];
  rotation: [number, number, number];
}

export const Pog = memo(({ id, theme, rarity, position, rotation }: PogProps) => {
  const rb = useRef<RapierRigidBody>(null);
  const shatteringIds = useGameStore((s) => s.shatteringIds);
  const finalizeShatter = useGameStore((s) => s.finalizeShatter);
  
  const isShattering = shatteringIds.includes(id);
  const [shatterStep, setShatterStep] = useState<'NONE' | 'SKELETON' | 'EXPLODED'>('NONE');

  // --- GHOST WIREFRAME ENGINE ---
  const rarityColors = {
    standard: '#00ffff',     // Cyan
    shiny: '#ff00ff',        // Magenta
    holographic: '#ffff00'   // Gold
  };
  const baseColor = rarityColors[rarity] || '#00ffff';

  const ghostMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 2,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Allows seeing through stacked pogs for 'digital lattice' effect
  }), [baseColor]);

  const pulseRef = useRef(0);

  const mass = useGameStore((state) => state.debugParams.pogMass);
  const friction = useGameStore((state) => state.debugParams.pogFriction);
  const restitution = useGameStore((state) => state.debugParams.pogRestitution);
  const linearDampingDefault = useGameStore((state) => state.debugParams.pogLinearDamping);
  const angularDampingDefault = useGameStore((state) => state.debugParams.pogAngularDamping);
  const pogScale = useGameStore((state) => state.debugParams.pogScale);
  const pogMaxVelocity = useGameStore((state) => state.debugParams.pogMaxVelocity);

  const winners = useGameStore((s) => s.winners);
  const isWinner = winners.includes(id);
  
  const userData = useMemo(() => ({ name: `pog-${id}`, theme, rarity, 'pog-id': id }), [id, theme, rarity]);

  useEffect(() => {
    if (isShattering && shatterStep === 'NONE') {
      setShatterStep('SKELETON');
      
      const t1 = setTimeout(() => setShatterStep('EXPLODED'), 300);
      const t2 = setTimeout(() => finalizeShatter(id), 2000);
      
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isShattering, shatterStep, finalizeShatter, id]);

  useEffect(() => {
    if (rb.current) {
      rb.current.setLinearDamping(linearDampingDefault);
      rb.current.setAngularDamping(angularDampingDefault);
      rb.current.userData = userData;
    }
  }, [linearDampingDefault, angularDampingDefault, userData]);

  const faceDownQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    return { x: q.x, y: q.y, z: q.z, w: q.w };
  }, []);

  useEffect(() => {
    if (rb.current && !isShattering) {
      rb.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true);
      rb.current.setRotation(faceDownQuat, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [position, rotation, faceDownQuat, isShattering]);

  const gameState = useGameStore((state) => state.gameState);
  const globalDampingScale = useGameStore((state) => state.globalDampingScale);
  const setPeakVelocity = useGameStore((state) => state.setPeakVelocity);
  
  useFrame((state) => {
    if (!rb.current) return;
    
    // GHOST PULSE Logic
    pulseRef.current = 2.0 + Math.sin(state.clock.elapsedTime * 6) * 1.5;
    if (isWinner) {
      pulseRef.current = 5.0 + Math.sin(state.clock.elapsedTime * 15) * 3.0; // Violent pulse on win
    }
    ghostMat.emissiveIntensity = pulseRef.current;
    ghostMat.opacity = isWinner ? 0.9 : 0.6;

    // ATOMIC HIT-STOP: Freeze all pog logic during impact crunch
    if (useGameStore.getState().hitStopActive) return;

    if (isShattering) return;

    if (cinematicEngine.isCinematicActive) {
      if (rb.current.bodyType() !== 0) rb.current.setBodyType(0, true);
    } else {
      if (gameState === 'SLAMMED') {
        if (rb.current.bodyType() !== 0) rb.current.setBodyType(0, true);
      } else if (gameState === 'AIMING') {
        if (rb.current.bodyType() !== 2) rb.current.setBodyType(2, true);
      }
    }

    if (cinematicEngine.isCinematicActive && globalDampingScale > 0) {
      rb.current.setLinearDamping(globalDampingScale);
      rb.current.setAngularDamping(globalDampingScale);
    } else {
      rb.current.setLinearDamping(linearDampingDefault);
      rb.current.setAngularDamping(angularDampingDefault);
    }

    const linvel = rb.current.linvel();
    const velocityMagnitude = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
    if (velocityMagnitude > 0.01) setPeakVelocity(velocityMagnitude);

    if (cinematicEngine.isCinematicActive && velocityMagnitude > pogMaxVelocity * 1.5) {
      const scaleVal = (pogMaxVelocity * 1.5) / velocityMagnitude;
      rb.current.setLinvel({
        x: linvel.x * scaleVal,
        y: linvel.y * scaleVal,
        z: linvel.z * scaleVal
      }, true);
    }
  });

  if (shatterStep === 'EXPLODED') {
    return (
      <group position={position}>
        {[...Array(6)].map((_, i) => (
          <ShardFragment 
            key={i} 
            position={[ (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5 ]} 
            color={rarity === 'holographic' ? '#ffff00' : rarity === 'shiny' ? '#00ffff' : '#ff00ff'}
          />
        ))}
      </group>
    );
  }

  return (
    <RigidBody 
      ref={rb}
      type="kinematicPosition"
      position={position} 
      rotation={[Math.PI, 0, 0]}
      colliders={false}
      mass={mass}
      restitution={restitution}
      friction={friction}
      linearDamping={linearDampingDefault}
      angularDamping={angularDampingDefault}
      ccd={true}
      canSleep={!isShattering}
    >
      <CylinderCollider args={[0.0245, 0.814]} />
      <mesh 
        material={ghostMat} 
        scale={pogScale} 
        renderOrder={20}
        visible={(shatterStep as string) !== 'EXPLODED'}
      >
        <cylinderGeometry args={[0.814, 0.814, 0.049, 32]} />
      </mesh>
    </RigidBody>
  );
});

Pog.displayName = 'Pog';
