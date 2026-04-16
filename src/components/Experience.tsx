import * as React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
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

export function Experience() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const sceneMode = useGameStore((state) => state.sceneMode);
  const cameraTension = useGameStore((state) => state.cameraTension);
  const isCinematicActive = useGameStore((state) => state.isCinematicActive);
  const debugParams = useGameStore((state) => state.debugParams);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  const orbitRef = React.useRef<any>(null);
  const cameraRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, -1.5, 0);
    }
  }, []);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 8, 6]}
        fov={50}
        onUpdate={(cam) => {
          if (isCinematicActive) return; // LOCKDOWN: GSAP has control
          
          const baseFOV = debugParams.baseFOV || 50;
          const targetFOV = baseFOV - (cameraTension * 15);
          cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);

          if (cameraTension > 0.8) {
            const shake = (cameraTension - 0.8) * 0.1;
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

      {sceneMode === 'ARCADE' ? <ArcadeMode /> : <ImpactLab />}
      <PhysicsWorld />
      <Reticle />
      <ImpactParticles />
      <Effects />
      <TimerUpdate />

      {!isCinematicActive && (
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          mouseButtons={{ LEFT: undefined, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={25}
          target={[0, 0, 0]}
        />
      )}
      <PerformanceMonitor />
      <AdaptiveQuality />
    </>
  );
}
