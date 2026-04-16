import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { useGLTF, Clone } from '@react-three/drei';

function makeNeonSignTexture(text: string, bgColor: string, textColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 512, 128);
  ctx.shadowBlur = 24; ctx.shadowColor = textColor;
  ctx.strokeStyle = textColor; ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.shadowBlur = 30; ctx.fillStyle = textColor;
  ctx.font = 'bold 60px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  return new THREE.CanvasTexture(canvas);
}

const SIGN_TEX_OPEN = makeNeonSignTexture('OPEN 24H', '#0a000a', '#ff007c');
const SIGN_TEX_SLAMZ = makeNeonSignTexture('SLAMZ', '#000a0a', '#00e5ff');

// Preload the arcade model
useGLTF.preload('/assets/Slamz_Arcade.glb');

function ArcadeCabinet({ 
  position, 
  rotation, 
  scale 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number];
  scale: number;
}) {
  const { scene } = useGLTF('/assets/Slamz_Arcade.glb');
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Clone object={scene} />
    </group>
  );
}

export function CyberAlley() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const debugParams = useGameStore((state) => state.debugParams);
  const isEnabled = currentAtmosphere === 'CYBER_ALLEY';
  
  const rainRef = useRef<THREE.Points>(null);
  const RAIN_COUNT = 500;
  
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    return geo;
  }, [rainPositions]);

  useFrame((_, delta) => {
    if (!rainRef.current || !isEnabled) return;
    const pos = rainRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - 20 * delta;
      if (y < 0) y = 20;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  if (!isEnabled) return null;

  // Read cabinet positioning from debug params
  const cabinetPositions: [number, number, number][] = [
    [debugParams.arcadeCabinetPositionX, debugParams.arcadeCabinetPositionY, debugParams.arcadeCabinetPositionZ],
    [-12, 0, -2],
    [12, 0, -8],
    [12, 0, -2]
  ];

  const cabinetRotations: [number, number, number][] = [
    [0, debugParams.arcadeCabinetRotationY, 0],
    [0, 0, 0],
    [0, Math.PI, 0],
    [0, Math.PI, 0]
  ];

  // Only show arcade cabinets on medium/high quality (934k tris is heavy) AND if visible
  const showArcades = qualityLevel !== 'low' && debugParams.arcadeCabinetVisible;

  return (
    <group>
      {/* WALLS */}
      <mesh position={[0, 7, -15]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#1a1012" roughness={0.9} />
      </mesh>
      <mesh position={[-15, 7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#1a1012" roughness={0.9} />
      </mesh>
      <mesh position={[15, 7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#1a1012" roughness={0.9} />
      </mesh>

      {/* SLAMZ ARCADE CABINETS */}
      {showArcades && (
        <ArcadeCabinet 
          position={cabinetPositions[0]} 
          rotation={cabinetRotations[0]} 
          scale={debugParams.arcadeCabinetScale}
        />
      )}

      {/* NEON SIGNS */}
      <mesh position={[-4, 8.5, -14.9]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial map={SIGN_TEX_OPEN} transparent />
      </mesh>
      <pointLight color="#ff007c" intensity={4} distance={10} position={[0, 9, -14]} />

      <mesh position={[4, 9.5, -14.9]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial map={SIGN_TEX_SLAMZ} transparent />
      </mesh>

      {/* RAIN */}
      <primitive object={new THREE.Points(rainGeo, new THREE.PointsMaterial({ 
        color: '#88ccff', size: 0.05, transparent: true, opacity: 0.4 
      }))} ref={rainRef} />
    </group>
  );
}
