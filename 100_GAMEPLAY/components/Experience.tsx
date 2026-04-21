import * as React from 'react';
import { PerspectiveCamera, Stats } from '@react-three/drei';
import { useGameStore } from '@100/store/useGameStore';
import * as THREE from 'three';
import { Reticle } from './game/Reticle';
import { ImpactParticles } from './game/ImpactParticles';
import { PhysicsWorld } from './game/PhysicsWorld';
import { TimerUpdate } from './game/TimerUpdate';
import { Effects } from '@400/components/Effects';
import { ArcadeMode } from './scenes/ArcadeMode';
import { ImpactLab } from './scenes/ImpactLab';
import { PerformanceMonitor } from '@500/components/PerformanceMonitor';
import { AdaptiveQuality } from '@500/components/AdaptiveQuality';
import { Physics } from '@react-three/rapier';
import { LevaController } from '@500/components/LevaController';
import { CameraController } from '@400/components/CameraController';
import { HarvestManager } from './game/HarvestManager';
import { ElectricalBolts } from '@400/components/ElectricalBolts';
import { GlitchEruption } from './game/GlitchEruption';

export function Experience() {
  const sceneMode = useGameStore((state) => state.sceneMode);
  const bulletTimeActive = useGameStore((state) => state.bulletTimeActive);
  const debugParams = useGameStore((state) => state.debugParams);
  const physicsDebug = useGameStore((state) => state.physicsDebug);
  const togglePhysicsDebug = useGameStore((state) => state.togglePhysicsDebug);
  
  // KEYBOARD SHORTCUTS
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        togglePhysicsDebug();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePhysicsDebug]);

  return (
    <>
      <PerspectiveCamera makeDefault />
      <CameraController />

      <color attach="background" args={[
        new THREE.Color().setRGB(
          debugParams.fogColorR ?? 0.004,
          debugParams.fogColorG ?? 0.012,
          debugParams.fogColorB ?? 0.031
        )
      ]} />
      
      <fog 
        attach="fog" 
        args={[
          new THREE.Color().setRGB(
            debugParams.fogColorR ?? 0.004,
            debugParams.fogColorG ?? 0.012,
            debugParams.fogColorB ?? 0.031
          ), 
          debugParams.fogNear ?? 5,
          debugParams.fogFar ?? 30
        ]} 
      />

      <Effects />
      <TimerUpdate />

      <Physics 
        gravity={bulletTimeActive ? [0, -2.5, 0] : [0, -16, 0]} 
        timeStep={1 / 60}
        numSolverIterations={48}
        numInternalPgsIterations={12}
        maxCcdSubsteps={4}
        paused={false}
        debug={physicsDebug}
        interpolate={true}
      >
        {sceneMode === 'ARCADE' ? <ArcadeMode /> : <ImpactLab />}
        <PhysicsWorld />
        <HarvestManager />
      </Physics>

      <Reticle />
      <ImpactParticles />
      <GlitchEruption />
      <ElectricalBolts />

      <PerformanceMonitor />
      <AdaptiveQuality />
      
      {import.meta.env.DEV && (
        <>
          <Stats />
          <LevaController />
        </>
      )}
    </>
  );
}

