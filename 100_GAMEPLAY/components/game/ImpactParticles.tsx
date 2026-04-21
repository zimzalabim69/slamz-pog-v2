import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';

/**
 * IMPACT PARTICLES — burst of sparks on slam collision
 * Listens for fogPulseTrigger as the impact signal.
 * Uses simple point sprites with velocity/gravity, no per-frame allocs.
 */

interface Spark {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  life: number;
  maxLife: number;
  size: number;
}

const MAX_SPARKS = 40;
const GRAVITY = -15;

export function ImpactParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const sparksRef = useRef<Spark[]>([]);
  const activeRef = useRef(false);
  const lastTrigger = useRef(0);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const fogPulseTrigger = useGameStore((state) => state.fogPulseTrigger);

  const positions = useMemo(() => new Float32Array(MAX_SPARKS * 3), []);
  const sizes = useMemo(() => new Float32Array(MAX_SPARKS), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  const material = useMemo(() => new THREE.PointsMaterial({
    color: '#ffaa00',
    size: 0.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Detect new impact via fogPulseTrigger change
    if (fogPulseTrigger !== lastTrigger.current) {
      lastTrigger.current = fogPulseTrigger;
      
      // Spawn burst
      const count = qualityLevel === 'low' ? 0 : qualityLevel === 'medium' ? 15 : MAX_SPARKS;
      const sparks: Spark[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        const upSpeed = 4 + Math.random() * 10;
        sparks.push({
          px: 0, py: 0.5, pz: 0,
          vx: Math.cos(angle) * speed,
          vy: upSpeed,
          vz: Math.sin(angle) * speed,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.6,
          size: 0.1 + Math.random() * 0.2,
        });
      }
      sparksRef.current = sparks;
      activeRef.current = true;
    }

    if (!activeRef.current) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;
    const sparks = sparksRef.current;
    const dt = Math.min(delta, 0.05);
    let anyAlive = false;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

    for (let i = 0; i < MAX_SPARKS; i++) {
      if (i >= sparks.length) {
        posAttr.setXYZ(i, 0, -100, 0);
        sizeAttr.setX(i, 0);
        continue;
      }

      const s = sparks[i];
      s.life += dt;

      if (s.life >= s.maxLife) {
        posAttr.setXYZ(i, 0, -100, 0);
        sizeAttr.setX(i, 0);
        continue;
      }

      anyAlive = true;
      s.vy += GRAVITY * dt;
      s.px += s.vx * dt;
      s.py += s.vy * dt;
      s.pz += s.vz * dt;

      const fadeOut = 1 - (s.life / s.maxLife);
      posAttr.setXYZ(i, s.px, Math.max(0, s.py), s.pz);
      sizeAttr.setX(i, s.size * fadeOut);
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    material.opacity = 0.9;

    if (!anyAlive) {
      activeRef.current = false;
    }
  });

  if (qualityLevel === 'low') return null;

  return (
    <points ref={pointsRef} geometry={geometry} material={material} visible={false} />
  );
}
