import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '@100/store/useGameStore';
import type { GameStore } from '@100/store/useGameStore';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { playShatterSound } from '@100/systems/audio';

const _targetPos = new THREE.Vector3();
const _slamzPos = new THREE.Vector3();

export function HarvestManager() {
  const { world } = useRapier();
  const gameState = useGameStore((s: GameStore) => s.gameState);
  const winners = useGameStore((s: GameStore) => s.winners);
  const setGameState = useGameStore((s: GameStore) => s.setGameState);
  const markForShatter = useGameStore((s: GameStore) => s.markForShatter);
  const shatteringIds = useGameStore((s: GameStore) => s.shatteringIds);

  const harvestStartTime = useRef(0);
  const processTriggered = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (gameState === 'HARVEST') {
      harvestStartTime.current = Date.now();
      processTriggered.current.clear();
    }
  }, [gameState]);

  useFrame((_state: any, _delta: number) => {
    if (gameState !== 'HARVEST' || !world) return;

    const elapsed = Date.now() - harvestStartTime.current;
    
    // 1. Find the centroid of winners to position the "Suction"
    let centerX = 0, centerZ = 0, count = 0;
    const activeWinners: string[] = [];

    world.forEachRigidBody((body) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('slamz-')) {
        const id = ud['slamz-id'];
        if (winners.includes(id) && !shatteringIds.includes(id)) {
          const trans = body.translation();
          centerX += trans.x;
          centerZ += trans.z;
          count++;
          activeWinners.push(id);
        }
      }
    });

    if (count > 0) {
      centerX /= count;
      centerZ /= count;
    }

    // 2. Control winner SHARDS (S.L.A.M.Z. Data Extraction)
    world.forEachRigidBody((body) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('slamz-')) {
        const id = ud['slamz-id'];
        if (winners.includes(id) && !shatteringIds.includes(id)) {
          // Disable gravity for abduction
          body.setGravityScale(0, true);
          
          const trans = body.translation();
          _slamzPos.set(trans.x, trans.y, trans.z);
          
          // Pull strictly UPWARDS along the individual abduction beam
          _targetPos.set(trans.x, 4, trans.z);
          const dir = _targetPos.clone().sub(_slamzPos).normalize();
          
          // Apply extraction suction
          body.applyImpulse({
            x: dir.x * 0.02, // Minimal horizontal drift
            y: 0.25 + (Math.random() * 0.1), // Stronger vertical pull
            z: dir.z * 0.02
          }, true);

          // If reached shatter height, finalize breach
          if (trans.y > 2.0 && !processTriggered.current.has(id)) {
            processTriggered.current.add(id);
            playShatterSound();
            markForShatter(id);
          }
        }
      }
    });

    if ((activeWinners.length === 0 && shatteringIds.length === 0) || elapsed > 5000) {
      setGameState('AIMING');
    }
  });

  const beamRef = useRef<THREE.InstancedMesh>(null);
  const beamMat = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (!beamRef.current || !world) return;
    
    let instanceIdx = 0;
    const isHarvesting = gameState === 'HARVEST';
    
    if (isHarvesting) {
        const time = state.clock.elapsedTime;
        if (beamMat.current) {
            beamMat.current.uniforms.uTime.value = time;
        }

        world.forEachRigidBody((body) => {
            const ud = body.userData as any;
            if (ud?.name?.startsWith('slamz-')) {
                const id = ud['slamz-id'];
                if (winners.includes(id) && !shatteringIds.includes(id) && instanceIdx < 15) {
                    const trans = body.translation();
                    _targetPos.set(trans.x, 10, trans.z); // Beam column height
                    
                    const mat = new THREE.Matrix4();
                    mat.makeTranslation(trans.x, 10, trans.z); // Center beam at 10 height
                    beamRef.current!.setMatrixAt(instanceIdx, mat);
                    instanceIdx++;
                }
            }
        });
    }

    // Hide remaining instances
    for (let i = instanceIdx; i < 15; i++) {
        const mat = new THREE.Matrix4().makeTranslation(0, -100, 0);
        beamRef.current.setMatrixAt(i, mat);
    }
    
    beamRef.current.instanceMatrix.needsUpdate = true;
    beamRef.current.visible = isHarvesting && instanceIdx > 0;
  });

  const beamUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00ffff') }
  }), []);

  const beamShader = {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float beam = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5));
        float flicker = 0.8 + 0.2 * sin(uTime * 40.0);
        float alpha = vUv.y * beam * flicker * 0.6;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  };

  return (
    <instancedMesh ref={beamRef} args={[undefined, undefined, 15]} visible={false}>
      <cylinderGeometry args={[1.5, 1.5, 20, 32, 1, true]} />
      <shaderMaterial 
        ref={beamMat}
        transparent 
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        uniforms={beamUniforms}
        vertexShader={beamShader.vertexShader}
        fragmentShader={beamShader.fragmentShader}
      />
    </instancedMesh>
  );
}
