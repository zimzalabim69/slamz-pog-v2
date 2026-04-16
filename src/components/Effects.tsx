import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useGameStore } from '../store/useGameStore';
import { SCENE_PRESETS } from '../constants/game';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function Effects() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const gameState = useGameStore((state) => state.gameState);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  if (qualityLevel === 'low' || gameState === 'RESETTING' || gameState === 'SESSION_SUMMARY') {
    return null;
  }

  if (qualityLevel === 'high' && !isMobile) {
    return (
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={preset.bloomStrength}
          luminanceThreshold={preset.bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(preset.chromaticAberration, preset.chromaticAberration)}
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={preset.bloomStrength}
        luminanceThreshold={preset.bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
