import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import type { GameStore } from '../../store/useGameStore';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getSetForTheme } from '../../constants/setDefinitions';



const _targetPos = new THREE.Vector3();
const _pogPos = new THREE.Vector3();

export function HarvestManager() {
  const { world } = useRapier();
  const gameState = useGameStore((s: GameStore) => s.gameState);
  const winners = useGameStore((s: GameStore) => s.winners);
  const setGameState = useGameStore((s: GameStore) => s.setGameState);
  const addToCollection = useGameStore((s: GameStore) => s.addToCollection);
  const removePog = useGameStore((s: GameStore) => s.removePog);
  const enqueueShowcase = useGameStore((s: GameStore) => s.enqueueShowcase);
  const updateStats = useGameStore((s: GameStore) => s.updateStats);
  const stats = useGameStore((s: GameStore) => s.stats);
  const pogs = useGameStore((s: GameStore) => s.pogs);


  const harvestStartTime = useRef(0);
  const harvestedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (gameState === 'HARVEST') {
      harvestStartTime.current = Date.now();
      harvestedIds.current.clear();
    }
  }, [gameState]);

  useFrame((_state: any, _delta: number) => {
    if (gameState !== 'HARVEST' || !world) return;

    const elapsed = Date.now() - harvestStartTime.current;


    
    // 1. Find the centroid of winners to position the Slammer hover
    let centerX = 0, centerZ = 0, count = 0;
    const activeWinners: string[] = [];

    world.forEachRigidBody((body) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        const id = ud['pog-id'];
        if (winners.includes(id) && !harvestedIds.current.has(id)) {
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

    // 2. Control winner POGs (Abduction)
    world.forEachRigidBody((body) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        const id = ud['pog-id'];
        if (winners.includes(id) && !harvestedIds.current.has(id)) {
          // Disable gravity for abduction
          body.setGravityScale(0, true);
          
          const trans = body.translation();
          _pogPos.set(trans.x, trans.y, trans.z);
          
          // Pull towards Slammer (which we'll hover at y=4)
          _targetPos.set(centerX, 4, centerZ);
          const dir = _targetPos.clone().sub(_pogPos).normalize();
          
          // Apply upward suction force
          body.applyImpulse({
            x: dir.x * 0.05,
            y: 0.15 + (Math.random() * 0.05), // Steady rise
            z: dir.z * 0.05
          }, true);

          // If reached abduction height, finalize capture
          if (trans.y > 3.5) {
            harvestedIds.current.add(id);
            const pogData = pogs.find((p: any) => p.id === id);
            if (pogData) {

              const setDef = getSetForTheme(pogData.theme);
              const values: Record<string, number> = { standard: 50, shiny: 250, holographic: 1500 };
              
              // Add to collection & prepare showcase
              addToCollection({ theme: pogData.theme, rarity: pogData.rarity, date: new Date().toISOString() });
              enqueueShowcase([{
                theme: pogData.theme,
                rarity: pogData.rarity,
                setName: setDef ? setDef.name : 'VINTAGE COLLECTIBLE',
                setColor: setDef ? setDef.color : '#00ffcc',
                marketValue: values[pogData.rarity as keyof typeof values] ?? 50,
              }]);

              updateStats({ pogsWon: stats.pogsWon + 1 });
              removePog(id);
            }
          }
        }
      }
    });

    // 3. Transition when all harvested or timeout
    if (activeWinners.length === 0 || elapsed > 4000) {
      setGameState('ROUND_JACKPOT');
    }
  });

  return null;
}
