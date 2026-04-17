import * as React from 'react';
import { PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import { SCENE_PRESETS } from '../constants/game';
import * as THREE from 'three';
import { Reticle } from './game/Reticle';
import { ImpactParticles } from './game/ImpactParticles';
import { PhysicsWorld } from './game/PhysicsWorld';
import { TimerUpdate } from './game/TimerUpdate';
import { Effects } from './Effects';
import { ArcadeMode } from './scenes/ArcadeMode';
import { ImpactLab } from './scenes/ImpactLab';
import { PerformanceMonitor } from './PerformanceMonitor';
import { AdaptiveQuality } from './AdaptiveQuality';
import { Physics } from '@react-three/rapier';
import { LevaController } from './LevaController';

export function Experience() {
  const sceneMode = useGameStore((state) => state.sceneMode);
  // Removed reactive cameraTension to prevent re-renders
  const isCinematicActive = useGameStore((state) => state.isCinematicActive);
  const bulletTimeActive = useGameStore((state) => state.bulletTimeActive);
  const debugParams = useGameStore((state) => state.debugParams);
  const physicsDebug = useGameStore((state) => state.physicsDebug);
  const togglePhysicsDebug = useGameStore((state) => state.togglePhysicsDebug);
  
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  const orbitRef = React.useRef<any>(null);
  const cameraRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, -1.5, 0);
    }
  }, []);

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
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 8, 6]}
        fov={50}
        onUpdate={(cam) => {
          if (useGameStore.getState().isCinematicActive) return; // LOCKDOWN: GSAP has control
          
          // Use getState() to avoid reactive re-renders
          const tension = useGameStore.getState().cameraTension;
          const debug = useGameStore.getState().debugParams;
          
          const baseFOV = debug.baseFOV || 50;
          const targetFOV = baseFOV - (tension * 15);
          cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);

          if (tension > 0.8) {
            const shake = (tension - 0.8) * 0.1;
            cam.position.x += (Math.random() - 0.5) * shake;
            cam.position.y += (Math.random() - 0.5) * shake;
          }

          cam.updateProjectionMatrix();
        }}
      />

      <color attach="background" args={[sceneMode === 'LAB' ? '#050510' : preset.bgColor]} />
      
      {/* GLOBAL FOG (REWIRED) */}
      <fogExp2 
        attach="fog" 
        args={[
          sceneMode === 'LAB' ? '#050510' : preset.bgColor, 
          debugParams.fogDensity || 0.01
        ]} 
      />

      <Effects />
      <TimerUpdate />

      <Physics 
        gravity={bulletTimeActive ? [0, -2.5, 0] : [0, -16, 0]} 
        timeStep={1 / 60}
        numSolverIterations={12}
        numInternalPgsIterations={4}
        maxCcdSubsteps={2}
        paused={false}
        debug={physicsDebug}
      >
        {sceneMode === 'ARCADE' ? <ArcadeMode /> : <ImpactLab />}
        <PhysicsWorld />
      </Physics>

      <Reticle />
      <ImpactParticles />

      {!isCinematicActive && (
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          mouseButtons={{ LEFT: undefined, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={0.1}
          maxDistance={10000}
          target={[0, debugParams.floorPositionY || -0.01, 0]}
        />
      )}
      <PerformanceMonitor />
      <AdaptiveQuality />
      
      {/* DEVELOPMENT TOOLS */}
      {import.meta.env.DEV && (
        <>
          <Stats />
          <LevaController />
        </>
      )}
    </>
  );
}
