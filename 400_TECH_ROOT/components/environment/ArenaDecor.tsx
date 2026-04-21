import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';
import { SCENE_PRESETS } from '@100/constants/game';
import { useTexture } from '@react-three/drei';

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

export function ArenaDecor() {
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  
  const matTexture = useTexture('/assets/slamz_mat.png');
  // Removed tiling to prevent affecting the shared texture in the main Arena


  // Instanced ghost pogs — 12 pogs in 1 draw call
  const pogRef = useRef<THREE.InstancedMesh>(null);
  const pogGeo = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16), []);
  const pogMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: preset.floorEmissive,
    roughness: 0.5,
    metalness: 0.8,
  }), [preset.floorEmissive]);

  const pogTransforms = useMemo(() => {
    const transforms: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 7 + Math.random() * 8;
      transforms.push({
        pos: [Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist],
        rot: [Math.random() * 0.1, Math.random() * Math.PI, Math.random() * 0.1],
        scale: 0.8 + Math.random() * 0.4,
      });
    }
    return transforms;
  }, []);

  useEffect(() => {
    if (!pogRef.current) return;
    pogTransforms.forEach((t, i) => {
      _position.set(t.pos[0], t.pos[1], t.pos[2]);
      _euler.set(t.rot[0], t.rot[1], t.rot[2]);
      _quaternion.setFromEuler(_euler);
      _scale.setScalar(t.scale);
      _matrix.compose(_position, _quaternion, _scale);
      pogRef.current!.setMatrixAt(i, _matrix);
    });
    pogRef.current.instanceMatrix.needsUpdate = true;
  }, [pogTransforms]);

  return null;
}
