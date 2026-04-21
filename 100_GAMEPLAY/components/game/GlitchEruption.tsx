import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';

/**
 * GLITCH ERUPTION — Kinetic Physics Edition (AAAA Effects Suite)
 * 
 * Cubes behave like real objects:
 *  - Power-scaled initial impulse (more power = bigger explosion radius)
 *  - Floor bounce using real slamz restitution value
 *  - Linear drag so they scatter and slow naturally
 *  - Frame-perfect sync with bulletTimeScale (slow-mo = cubes freeze in air)
 */

const MAX_CUBES = 120;
const GRAVITY = -18.0;
const LINEAR_DRAG = 0.92; // Air resistance coefficient per second
const FLOOR_Y = 0.05;     // Arena floor height

interface CubeParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Euler;
  scale: number;
  life: number;
  maxLife: number;
  bounces: number;
}

export function GlitchEruption() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const impactFlashActive = useGameStore((s) => s.impactFlashActive);
  const perfectHitActive  = useGameStore((s) => s.perfectHitActive);
  const bulletTimeScale   = useGameStore((s) => s.bulletTimeScale);
  const qualityLevel      = useGameStore((s) => s.qualityLevel);
  const power             = useGameStore((s) => s.power);
  const slamzRestitution    = useGameStore((s) => s.debugParams.slamzRestitution);

  const particles = useRef<CubeParticle[]>([]);
  const lastFlash = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const isImpact = impactFlashActive || perfectHitActive;

    // ── SPAWN on new impact ──────────────────────────────────────────────
    if (isImpact && !lastFlash.current) {
      const count   = perfectHitActive ? MAX_CUBES : Math.floor(MAX_CUBES * 0.55);
      // Power factor: 0.4 at minimum swing, 1.0 at perfect hit
      const powerFactor = 0.4 + (power / 100) * 0.6;
      const newParticles: CubeParticle[] = [];

      for (let i = 0; i < count; i++) {
        const phi   = Math.random() * Math.PI * 2;
        // Wider cone — not just up, all directions like a real disc shattering
        const theta = (Math.random() * Math.PI * 0.65);
        const speed = (6 + Math.random() * 14) * powerFactor;

        newParticles.push({
          pos: new THREE.Vector3(
            (Math.random() - 0.5) * 0.6,
            0.3 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.6
          ),
          vel: new THREE.Vector3(
            Math.sin(theta) * Math.cos(phi) * speed,
            (Math.cos(theta) * speed + 3) * powerFactor,
            Math.sin(theta) * Math.sin(phi) * speed
          ),
          rot: new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
          rotVel: new THREE.Euler(
            (Math.random() - 0.5) * 25 * powerFactor,
            (Math.random() - 0.5) * 25 * powerFactor,
            (Math.random() - 0.5) * 25 * powerFactor
          ),
          scale: (0.04 + Math.random() * 0.12) * (0.7 + powerFactor * 0.3),
          life: 0,
          maxLife: (1.5 + Math.random() * 2.0) / powerFactor,
          bounces: 0,
        });
      }
      particles.current = newParticles;
    }
    lastFlash.current = isImpact;

    // ── UPDATE — bullet-time aware ───────────────────────────────────────
    // Use store bulletTimeScale so cubes freeze identically to slamzs in cinematic
    const timeScale = bulletTimeScale ?? 1.0;
    const dt        = Math.min(delta, 0.05) * timeScale;

    const restitution = Math.min(slamzRestitution ?? 0.35, 0.6); // Safe cap to prevent infinite bounce
    let activeCount = 0;

    particles.current.forEach((p, i) => {
      if (p.life >= p.maxLife) {
        dummy.position.set(0, -200, 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // ── Gravity ──
      p.vel.y += GRAVITY * dt;

      // ── Position ──
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.pos.z += p.vel.z * dt;

      // ── Floor Bounce ── (like a real slamz hitting the mat)
      if (p.pos.y < FLOOR_Y && p.bounces < 4) {
        p.pos.y   = FLOOR_Y;
        p.vel.y   = Math.abs(p.vel.y) * restitution;
        // Friction on horizontal axes when bouncing
        p.vel.x  *= 0.78;
        p.vel.z  *= 0.78;
        p.bounces++;
        // Spin changes on impact like a real disc
        p.rotVel.x *= -0.5;
        p.rotVel.z *= -0.5;
      } else if (p.pos.y < FLOOR_Y) {
        // Floor rest after max bounces
        p.pos.y   = FLOOR_Y;
        p.vel.y   = 0;
        p.vel.x  *= 0.6;
        p.vel.z  *= 0.6;
      }

      // ── Air Drag (frame-rate independent) ──
      const drag = Math.pow(LINEAR_DRAG, dt * 60);
      p.vel.x *= drag;
      p.vel.z *= drag;

      // ── Rotation ──
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;
      p.rot.z += p.rotVel.z * dt;
      // Spin damping
      p.rotVel.x *= drag;
      p.rotVel.y *= drag;
      p.rotVel.z *= drag;

      p.life += dt;

      // ── Render ──
      const lifeFactor = Math.max(0, 1.0 - (p.life / p.maxLife));
      dummy.position.copy(p.pos);
      dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.scale * Math.sqrt(lifeFactor));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      activeCount++;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.visible = activeCount > 0 || isImpact;
  });

  if (qualityLevel === 'low') return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_CUBES]} visible={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={5}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
