import { Suspense } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import { SCENE_PRESETS } from '@100/constants/game';
import { Arena } from '../game/Arena';
import { CyberAlley } from '@400/components/environment/CyberAlley';
import { ArenaDecor } from '@400/components/environment/ArenaDecor';
import { SessionSummary } from '@200/components/ui/SessionSummary';

/**
 * ARCADE MODE SCENE
 * The full, high-fidelity experience with all environmental assets.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ArcadeMode() {
  const gameState = useGameStore((s) => s.gameState);
  const power = useGameStore((s) => s.power);
  const impactFlashActive = useGameStore((s) => s.impactFlashActive);
  const perfectHitActive = useGameStore((s) => s.perfectHitActive);
  const hitStopActive = useGameStore((s) => s.hitStopActive);
  const debugParams = useGameStore((state) => state.debugParams);
  
  const intensityRef = useRef(1);
  const flashRef = useRef(0);
  const pulseColor = useRef(new THREE.Color('#00ffff'));

  useFrame((_, delta) => {
    // 1. POWER DRAIN: Lights dim as you suck juice for the slam
    const targetIntensity = gameState === 'POWERING' ? 0.3 + (1 - power / 100) * 0.7 : 1.0;
    intensityRef.current = THREE.MathUtils.lerp(intensityRef.current, targetIntensity, 0.1);

    // 2. IMPACT FLASH: Brightness spike on hit
    if (impactFlashActive || perfectHitActive) {
      flashRef.current = perfectHitActive ? 4.0 : 2.0;
      pulseColor.current.set(perfectHitActive ? '#ffff00' : '#00ffff');
    }
    flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, 0.15);
  });

  const preset = SCENE_PRESETS.CYBER_ALLEY;

  return (
    <>
      <ambientLight 
        color={preset.ambientColor} 
        intensity={preset.ambientIntensity * (debugParams.arenaAmbientIntensity ?? 1) * 2.5 * intensityRef.current} 
      />

      <hemisphereLight
        color={preset.spotColor}
        groundColor={preset.ambientColor}
        intensity={(debugParams.arenaAmbientIntensity ?? 1) * 0.4}
      />

      {/* Main Directional/Key Light */}
      <directionalLight
        position={[
          debugParams.arenaDirLightPositionX,
          debugParams.arenaDirLightPositionY,
          debugParams.arenaDirLightPositionZ
        ]}
        intensity={debugParams.arenaDirLightIntensity}
        color={preset.spotColor}
      />

      {/* Atmospheric Spot */}
      <spotLight
        position={[
          debugParams.arenaSpotLightPositionX,
          debugParams.arenaSpotLightPositionY,
          debugParams.arenaSpotLightPositionZ
        ]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={debugParams.arenaSpotLightIntensity * (intensityRef.current + flashRef.current)}
        color={flashRef.current > 0.1 ? pulseColor.current : preset.spotColor}
      />

      {/* Primary Point */}
      <pointLight 
        position={[
          debugParams.arenaPointLightPositionX,
          debugParams.arenaPointLightPositionY,
          debugParams.arenaPointLightPositionZ
        ]} 
        intensity={debugParams.arenaPointLightIntensity * (intensityRef.current + flashRef.current)} 
        color={flashRef.current > 0.1 ? pulseColor.current : preset.pointColor} 
      />

      {/* Fill Point */}
      <pointLight 
        position={[
          debugParams.arenaPoint2LightPositionX,
          debugParams.arenaPoint2LightPositionY,
          debugParams.arenaPoint2LightPositionZ
        ]} 
        intensity={debugParams.arenaPoint2LightIntensity} 
        color={preset.spotColor} 
      />

      {/* LIGHT HELPERS — "Editor Style" Visuals */}
      {debugParams.arenaShowLightHelpers && (
        <group>
          {/* Dir Light Helper */}
          <mesh position={[debugParams.arenaDirLightPositionX, debugParams.arenaDirLightPositionY, debugParams.arenaDirLightPositionZ]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffff00" wireframe />
          </mesh>
          {/* Spot Light Helper */}
          <mesh position={[debugParams.arenaSpotLightPositionX, debugParams.arenaSpotLightPositionY, debugParams.arenaSpotLightPositionZ]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#00e5ff" wireframe />
          </mesh>
          {/* Point 1 Helper */}
          <mesh position={[debugParams.arenaPointLightPositionX, debugParams.arenaPointLightPositionY, debugParams.arenaPointLightPositionZ]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#ff007c" wireframe />
          </mesh>
          {/* Point 2 Helper */}
          <mesh position={[debugParams.arenaPoint2LightPositionX, debugParams.arenaPoint2LightPositionY, debugParams.arenaPoint2LightPositionZ]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#00ffcc" wireframe />
          </mesh>
        </group>
      )}
      
      {/* Visual Environment */}
      <Suspense fallback={null}><Arena /></Suspense>
      <Suspense fallback={null}><ArenaDecor /></Suspense>
      <CyberAlley />

      {/* 3D HUD & Overlays */}
      <SessionSummary />
    </>
  );
}

