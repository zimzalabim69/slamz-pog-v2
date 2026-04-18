// @ts-nocheck
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { useGameStore } from '../store/useGameStore';
import { SCENE_PRESETS } from '../constants/game';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * SLAMZ AAAA POST-PROCESSING STACK
 * Optimized for high-fidelity arcade aesthetics with support for hardware scaling.
 */
export function Effects() {
  const gameState = useGameStore((state) => state.gameState);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  if (qualityLevel === 'low' || gameState === 'RESETTING' || gameState === 'SESSION_SUMMARY') {
    return null;
  }

  const isHighQuality = qualityLevel === 'high' && !isMobile;
  const isCinematic = gameState === 'PAUSED';

  return (
    <EffectComposer 
        enableNormalPass={false} 
        stencilBuffer={false} // Optimization for AAAA delivery
        multisampling={isHighQuality ? 8 : 0}
    >
      <Bloom
        intensity={preset.bloomStrength}
        luminanceThreshold={preset.bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      {isHighQuality && (
        <ChromaticAberration
          blendFunction={BlendFunction.SCREEN}
          offset={new THREE.Vector2(preset.chromaticAberration * 0.8, preset.chromaticAberration * 0.8)}
        />
      )}

      {/* AAAA Dithering & Anti-Banding Film Grain */}
      <Noise 
        opacity={isHighQuality ? 0.04 : 0.02} 
        premultiply 
        blendFunction={BlendFunction.SOFT_LIGHT} 
      />

      {/* Focus vignette for cinematic immersion */}
      <Vignette 
        eskil={false} 
        offset={0.5} 
        darkness={isCinematic ? 0.7 : 0.4} 
      />

    </EffectComposer>
  );
}
