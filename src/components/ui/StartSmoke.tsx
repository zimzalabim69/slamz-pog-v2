import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Procedural soft smoke texture
function createSmokeTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface SmokePuff {
  xNorm: number;
  zNorm: number;
  yOffset: number;
  driftX: number;
  driftZ: number;
  rotSpeed: number;
  phase: number;
  bobSpeed: number;
  bobAmp: number;
  scaleBase: number;
  opacityBase: number;
}

const LAYER_MAX = 30;

function createPuffs(count: number, heightVariance: number): SmokePuff[] {
  const puffs: SmokePuff[] = [];
  for (let i = 0; i < count; i++) {
    puffs.push({
      xNorm: (Math.random() - 0.5) * 2,
      zNorm: (Math.random() - 0.5) * 2,
      yOffset: (Math.random() - 0.5) * heightVariance,
      driftX: (Math.random() - 0.5) * 0.3,
      driftZ: (Math.random() - 0.5) * 0.15,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      bobSpeed: 0.08 + Math.random() * 0.12,
      bobAmp: 0.2 + Math.random() * 0.5,
      scaleBase: 0.7 + Math.random() * 0.6,
      opacityBase: 0.5 + Math.random() * 0.5,
    });
  }
  return puffs;
}

function SmokeLayer({ prefix }: { prefix: 'smokeGround' | 'smokeMid' }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const debugParams = useGameStore((state) => state.debugParams);
  const smokeTexture = useMemo(() => createSmokeTexture(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const frozen = useRef(false);

  const puffs = useMemo(() => createPuffs(LAYER_MAX, prefix === 'smokeGround' ? 3 : 6), [prefix]);

  const materials = useMemo(() =>
    Array.from({ length: LAYER_MAX }).map(() =>
      new THREE.MeshBasicMaterial({
        map: smokeTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
      })
    ), [smokeTexture]);

  useFrame(({ clock, camera }) => {
    // Once frozen, don't update anything
    if (frozen.current) return;

    const dp = debugParams;
    const colorR = dp[`${prefix}ColorR`] as number;
    const colorG = dp[`${prefix}ColorG`] as number;
    const colorB = dp[`${prefix}ColorB`] as number;
    const opacity = dp[`${prefix}Opacity`] as number;
    const speed = dp[`${prefix}Speed`] as number;
    const count = Math.min(Math.round(dp[`${prefix}Count`] as number), LAYER_MAX);
    const size = dp[`${prefix}Size`] as number;
    const spread = dp[`${prefix}Spread`] as number;
    const height = dp[`${prefix}Height`] as number;

    const time = clock.elapsedTime;
    const color = new THREE.Color(colorR, colorG, colorB);

    for (let i = 0; i < LAYER_MAX; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      if (i >= count) {
        mesh.visible = false;
        continue;
      }

      const p = puffs[i];
      mesh.visible = true;

      const drift = time * speed;

      let px = p.xNorm * spread + Math.sin(drift * p.driftX + p.phase) * spread * 0.25;
      px += Math.sin(drift * 0.06 + p.phase) * 10;
      const pz = p.zNorm * spread * 0.4 + Math.cos(drift * p.driftZ + p.phase) * spread * 0.1;
      const py = height + p.yOffset + Math.sin(time * p.bobSpeed + p.phase) * p.bobAmp;

      mesh.position.set(px, py, pz - 40);

      const s = p.scaleBase * size;
      mesh.scale.set(s, s * 0.5, 1);

      mesh.quaternion.copy(camera.quaternion);
      mesh.rotation.z += p.rotSpeed * 0.008;

      const mat = materials[i];
      mat.color.copy(color);
      mat.opacity = p.opacityBase * opacity;
    }
  });

  return (
    <group>
      {Array.from({ length: LAYER_MAX }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          geometry={geometry}
          material={materials[i]}
          visible={false}
        />
      ))}
    </group>
  );
}

export function StartSmoke() {
  return (
    <>
      <SmokeLayer prefix="smokeGround" />
      <SmokeLayer prefix="smokeMid" />
    </>
  );
}

