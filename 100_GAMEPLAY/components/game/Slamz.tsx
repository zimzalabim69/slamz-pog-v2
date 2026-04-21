import { RigidBody, CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@100/store/useGameStore';
import { useRef, useEffect, memo, useMemo, useState } from 'react';
import { getMaterialFromRegistry, generateGlowTexture } from '@500/utils/TextureGenerator';
import { cinematicEngine } from '@400/systems/CinematicEngine';
import { GAME_CONFIG } from '@100/constants/gameConfig';
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
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          wireframe={true}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </RigidBody>
  );
};

const GlowHalo = ({ color, opacity }: { color: string, opacity: number }) => {
  const tex = useMemo(() => generateGlowTexture(), []);
  return (
    <sprite scale={[4, 4, 1]}>
      <spriteMaterial 
        map={tex} 
        color={color} 
        transparent 
        opacity={opacity * 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};

interface SlamzProps {
  id: string;
  theme: string;
  rarity: 'standard' | 'shiny' | 'holographic';
  position: [number, number, number];
  rotation: [number, number, number];
}

export const Slamz = memo(({ id, theme, rarity, position, rotation }: SlamzProps) => {
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

  const ghostMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: baseColor,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Allows seeing through stacked slamz for 'digital lattice' effect
  }), [baseColor]);

  const pulseRef = useRef(0);

  const mass = GAME_CONFIG.SLAMZ_MASS;
  const friction = GAME_CONFIG.SLAMZ_FRICTION;
  const restitution = GAME_CONFIG.SLAMZ_RESTITUTION;
  const linearDampingDefault = GAME_CONFIG.SLAMZ_LINEAR_DAMPING;
  const angularDampingDefault = GAME_CONFIG.SLAMZ_ANGULAR_DAMPING;
  const slamzScale = GAME_CONFIG.SLAMZ_SCALE;
  const slamzMaxVelocity = GAME_CONFIG.SLAMZ_MAX_VELOCITY;

  const winners = useGameStore((s) => s.winners);
  const isWinner = winners.includes(id);
  
  const userData = useMemo(() => ({ name: `slamz-${id}`, theme, rarity, 'slamz-id': id }), [id, theme, rarity]);

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
    
    // GHOST PULSE Logic (Opacity-based for MeshBasicMaterial)
    const pulseBase = isWinner ? 0.8 : 0.5;
    const pulseAmount = isWinner ? 0.2 : 0.1;
    ghostMat.opacity = pulseBase + Math.sin(state.clock.elapsedTime * (isWinner ? 15 : 6)) * pulseAmount;

    // ATOMIC HIT-STOP: Freeze all slamz logic during impact crunch
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

    if (cinematicEngine.isCinematicActive && velocityMagnitude > slamzMaxVelocity * 1.5) {
      const scaleVal = (slamzMaxVelocity * 1.5) / velocityMagnitude;
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
        scale={slamzScale} 
        renderOrder={20}
        visible={(shatterStep as string) !== 'EXPLODED'}
      >
        <cylinderGeometry args={[0.814, 0.814, 0.049, 32]} />
      </mesh>
      <GlowHalo color={baseColor} opacity={ghostMat.opacity} />
    </RigidBody>
  );
});

Slamz.displayName = 'Slamz';
