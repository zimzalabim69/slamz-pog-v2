import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../utils/AudioManager';

// ─── Easing Functions ───────────────────────────────────────

function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  }
}

function slamEase(t: number): number {
  if (t < 0.15) return t * 0.1;
  const slamT = Math.min((t - 0.15) / 0.85, 1);
  return 0.015 + 0.985 * easeOutBounce(slamT);
}

const SLAM_DURATION = 1.2;
const DROP_HEIGHT = 60;
const DROP_SCALE_BOOST = 1.3;

// ─── Pog Explosion System ───────────────────────────────────

interface PogParticle {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  avx: number; avy: number; avz: number;
  scale: number;
  settled: boolean;
  groundY: number;
  bounces: number;
}

const GRAVITY = -40;
const PARTICLE_COUNT = 25;
const GROUND_Y = -6;
const DAMPING = 0.55;
const ANGULAR_DAMPING = 0.88;

function createParticles(ix: number, iy: number, iz: number): PogParticle[] {
  const particles: PogParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.8;
    const speed = 6 + Math.random() * 18;
    const upSpeed = 8 + Math.random() * 22;

    particles.push({
      px: ix, py: iy, pz: iz,
      vx: Math.cos(angle) * speed,
      vy: upSpeed,
      vz: Math.sin(angle) * speed * 0.5 + (Math.random() - 0.5) * 10,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      avx: (Math.random() - 0.5) * 18,
      avy: (Math.random() - 0.5) * 18,
      avz: (Math.random() - 0.5) * 18,
      scale: (0.5 + Math.random() * 0.6) * 1.5,
      settled: false,
      groundY: GROUND_Y + Math.random() * 1.0,
      bounces: 0,
    });
  }
  return particles;
}

function PogExplosion({ active, impactX, impactY, impactZ }: {
  active: boolean;
  impactX: number;
  impactY: number;
  impactZ: number;
}) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particlesRef = useRef<PogParticle[] | null>(null);

  // Shared geometry (cylinder pog shape)
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.09, 24), []);

  // SLAMZ graffiti gradient materials - each pog gets a unique 2-color gradient
  const materials = useMemo(() => {
    const palette = [
      new THREE.Color('#00ffff'), // bright cyan
      new THREE.Color('#ff00ff'), // hot magenta
      new THREE.Color('#8800ff'), // deep purple
      new THREE.Color('#00aaff'), // electric blue
      new THREE.Color('#cc44ff'), // violet
      new THREE.Color('#00ffcc'), // teal cyan
      new THREE.Color('#ff44aa'), // pink magenta
      new THREE.Color('#4400ff'), // neon indigo
      new THREE.Color('#ff00cc'), // fuchsia
      new THREE.Color('#0066ff'), // royal blue
    ];

    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const c1 = palette[i % palette.length];
      const c2 = palette[(i + 3 + Math.floor(i / palette.length)) % palette.length];

      return new THREE.ShaderMaterial({
        uniforms: {
          colorA: { value: c1 },
          colorB: { value: c2 },
          emissiveIntensity: { value: 0.6 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPos.xyz);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform float emissiveIntensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            // Diagonal gradient across the pog face
            float grad = smoothstep(0.0, 1.0, (vUv.x + vUv.y) * 0.5);
            vec3 baseColor = mix(colorA, colorB, grad);

            // Metallic fresnel rim
            float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
            vec3 rimColor = mix(colorA, colorB, 0.5) * 2.0;

            // Combine: base + emissive glow + metallic rim
            vec3 color = baseColor * 0.6 + baseColor * emissiveIntensity + rimColor * fresnel * 0.8;

            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });
    });
  }, []);

  useFrame((_, delta) => {
    if (!active) return;

    // Lazy init particles on first active frame
    if (!particlesRef.current) {
      particlesRef.current = createParticles(impactX, impactY, impactZ);
    }

    const dt = Math.min(delta, 0.05);
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      if (p.settled) {
        // Just keep it visible at rest position
        mesh.visible = true;
        continue;
      }

      // Physics integration
      p.vy += GRAVITY * dt;
      p.px += p.vx * dt;
      p.py += p.vy * dt;
      p.pz += p.vz * dt;
      p.rx += p.avx * dt;
      p.ry += p.avy * dt;
      p.rz += p.avz * dt;

      // Ground bounce
      if (p.py <= p.groundY) {
        p.py = p.groundY;
        p.vy = Math.abs(p.vy) * DAMPING;
        p.vx *= 0.75;
        p.vz *= 0.75;
        p.avx *= ANGULAR_DAMPING;
        p.avy *= ANGULAR_DAMPING;
        p.avz *= ANGULAR_DAMPING;
        p.bounces++;

        if (p.bounces > 3 || Math.abs(p.vy) < 0.4) {
          p.settled = true;
          p.vx = p.vy = p.vz = 0;
          p.avx = p.avy = p.avz = 0;
          // Flatten to lie flat-ish
          p.rx = Math.round(p.rx / Math.PI) * Math.PI;
          p.rz = Math.round(p.rz / Math.PI) * Math.PI;
        }
      }

      // Apply to mesh
      mesh.position.set(p.px, p.py, p.pz);
      mesh.rotation.set(p.rx, p.ry, p.rz);
      mesh.scale.setScalar(p.scale);
      mesh.visible = true;
    }
  });

  if (!active) return null;

  return (
    <group>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          geometry={geometry}
          material={materials[i]}
          visible={false}
          castShadow
        />
      ))}
    </group>
  );
}

// ─── StartLogo3D (Main Component) ───────────────────────────

export function StartLogo3D() {
  const groupRef = useRef<THREE.Group>(null);
  const debugParams = useGameStore((state) => state.debugParams);
  const [slamTime, setSlamTime] = useState(0);
  const [hasLanded, setHasLanded] = useState(false);
  const [explosionActive, setExplosionActive] = useState(false);
  const impactFired = useRef(false);
  const impactCoords = useRef({ x: 0, y: 0, z: 0 });

  // Load the GLB model
  const { scene } = useGLTF('/assets/slamz_logo.glb');

  // Fire impact effects once
  const fireImpact = useCallback(() => {
    if (impactFired.current) return;
    impactFired.current = true;

    const dp = useGameStore.getState().debugParams;
    impactCoords.current = {
      x: dp.logoPositionX,
      y: dp.logoPositionY,
      z: dp.logoPositionZ,
    };

    // Screen shake
    const startScreen = document.querySelector('.start-screen');
    if (startScreen) {
      startScreen.classList.add('logo-impact-shake');
      setTimeout(() => startScreen.classList.remove('logo-impact-shake'), 500);
    }

    // Audio
    audioManager.playSfx('slam_start', 0.7);

    // Haptic
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 20, 80]);
    }

    // POG EXPLOSION
    setExplosionActive(true);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const dp = debugParams;

    if (!hasLanded) {
      const newTime = slamTime + delta;
      setSlamTime(newTime);

      const progress = Math.min(newTime / SLAM_DURATION, 1);
      const eased = slamEase(progress);

      const startY = dp.logoPositionY + DROP_HEIGHT;
      const currentY = startY + (dp.logoPositionY - startY) * eased;

      const startScale = dp.logoScale * DROP_SCALE_BOOST;
      const currentScale = startScale + (dp.logoScale - startScale) * eased;

      const currentX = dp.logoPositionX + (1 - eased) * 2;
      const currentZ = dp.logoPositionZ + (1 - eased) * -5;

      const tumble = (1 - eased) * 0.3;

      groupRef.current.position.set(currentX, currentY, currentZ);
      groupRef.current.scale.setScalar(currentScale);
      groupRef.current.rotation.x = dp.logoRotationX + tumble * 0.5;
      groupRef.current.rotation.y = dp.logoRotationY + tumble;
      groupRef.current.rotation.z = dp.logoRotationZ - tumble * 0.3;

      if (progress > 0.45 && !impactFired.current) {
        fireImpact();
      }

      if (progress >= 1) {
        setHasLanded(true);
      }
    } else {
      groupRef.current.position.set(dp.logoPositionX, dp.logoPositionY, dp.logoPositionZ);
      groupRef.current.scale.setScalar(dp.logoScale);
      groupRef.current.rotation.x = dp.logoRotationX;
      groupRef.current.rotation.y = dp.logoRotationY + Math.sin(Date.now() * 0.0003) * 0.05;
      groupRef.current.rotation.z = dp.logoRotationZ;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <primitive object={scene.clone()} />
      </group>
      <PogExplosion
        active={explosionActive}
        impactX={impactCoords.current.x}
        impactY={impactCoords.current.y}
        impactZ={impactCoords.current.z}
      />
    </>
  );
}

// Preload the model
useGLTF.preload('/assets/slamz_logo.glb');
