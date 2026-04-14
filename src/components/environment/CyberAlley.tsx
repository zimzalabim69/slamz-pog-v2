import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

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

function makeCabinetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, 256, 512);
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 20, 512); ctx.fillRect(236, 0, 20, 512);
  const screenGrad = ctx.createLinearGradient(30, 80, 226, 260);
  screenGrad.addColorStop(0, 'rgba(0,229,255,0.3)');
  screenGrad.addColorStop(1, 'rgba(255,0,124,0.2)');
  ctx.fillStyle = screenGrad; ctx.fillRect(30, 80, 196, 180);
  ctx.fillStyle = '#111122'; ctx.fillRect(20, 300, 216, 80);
  ctx.fillStyle = '#ff007c'; ctx.beginPath(); ctx.arc(80, 340, 14, 0, Math.PI * 2); ctx.fill();
  const btnColors = ['#00e5ff', '#ff007c', '#ffcc00', '#00ff88'];
  btnColors.forEach((c, i) => {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(140 + i * 20, 340, 8, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#00e5ff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00e5ff';
  ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.fillText('SLAMZ', 128, 430);
  return new THREE.CanvasTexture(canvas);
}

const SIGN_TEX_OPEN = makeNeonSignTexture('OPEN 24H', '#0a000a', '#ff007c');
const SIGN_TEX_SLAMZ = makeNeonSignTexture('SLAMZ', '#000a0a', '#00e5ff');
const CAB_TEX = makeCabinetTexture();

export function CyberAlley() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const isEnabled = currentAtmosphere === 'CYBER_ALLEY';
  
  const rainRef = useRef<THREE.Points>(null);
  const RAIN_COUNT = 1500;
  
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

  const cabinetPositions: [number, number, number][] = [
    [-12, 2.5, -8], [-12, 2.5, -2], [12, 2.5, -8], [12, 2.5, -2]
  ];

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

      {/* ARCADE CABINETS */}
      {cabinetPositions.map((pos, i) => (
        <group key={i} position={pos} rotation={[0, i < 2 ? 0 : Math.PI, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 5, 3.5]} />
            <meshStandardMaterial map={CAB_TEX} roughness={0.4} metalness={0.5} />
          </mesh>
          <pointLight color="#00e5ff" intensity={4} distance={5} position={[0, 2, 1.8]} />
        </group>
      ))}

      {/* NEON SIGNS */}
      <mesh position={[-4, 8.5, -14.9]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial map={SIGN_TEX_OPEN} transparent />
      </mesh>
      <pointLight color="#ff007c" intensity={3} distance={8} position={[-4, 8.5, -14]} />

      <mesh position={[4, 9.5, -14.9]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial map={SIGN_TEX_SLAMZ} transparent />
      </mesh>
      <pointLight color="#00e5ff" intensity={3} distance={8} position={[4, 9.5, -14]} />

      {/* RAIN */}
      <primitive object={new THREE.Points(rainGeo, new THREE.PointsMaterial({ 
        color: '#88ccff', size: 0.05, transparent: true, opacity: 0.4 
      }))} ref={rainRef} />
    </group>
  );
}
