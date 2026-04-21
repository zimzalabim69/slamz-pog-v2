import { useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, ToneMapping, Glitch } from '@react-three/postprocessing';
import { N8AOPostPass } from 'n8ao';
import { useGameStore } from '@100/store/useGameStore';
import { SCENE_PRESETS } from '@100/constants/game';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

/**
 * SLAMZ AAAA POST-PROCESSING STACK
 * Optimized for high-fidelity arcade aesthetics with support for hardware scaling.
 */
/**
 * CUSTOM N8AO WRAPPER
 * Since n8ao exports a postprocessing-compatible pass, we use a primitive 
 * to inject it into the Effects stack.
 */
function N8AO(props: any) {
  const { scene, camera } = useThree()
  const pass = useMemo(() => new N8AOPostPass(scene, camera), [scene, camera])

  useFrame(() => {
    if (props.intensity !== undefined) pass.configuration.intensity = props.intensity
    if (props.aoRadius !== undefined) pass.configuration.aoRadius = props.aoRadius
    if (props.halfRes !== undefined) pass.configuration.halfRes = props.halfRes
    if (props.distanceFalloff !== undefined) pass.configuration.distanceFalloff = props.distanceFalloff
    if (props.quality !== undefined) pass.setQualityMode(props.quality)
  }, 1) // High priority for pass updates

  return <primitive object={pass} />
}

export function Effects() {
  const gameState = useGameStore((state) => state.gameState);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const bulletTimeActive = useGameStore((state) => state.bulletTimeActive);
  const swarmActive = useGameStore((state) => state.swarmActive);
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  if (qualityLevel === 'low' || gameState === 'RESETTING' || gameState === 'SESSION_SUMMARY') {
    return null;
  }

  const isHighQuality = qualityLevel === 'high' && !isMobile;
  const isCinematic = gameState === 'PAUSED';

  return (
    <EffectComposer 
        enableNormalPass={true} 
        stencilBuffer={false} // Optimization for AAAA delivery
        multisampling={isHighQuality ? 8 : 0}
    >
      <N8AO 
        halfRes={!isHighQuality} 
        aoRadius={0.5} 
        distanceFalloff={1.0} 
        intensity={2.0} 
        quality="arcane" // AAAA quality setting
      />

      <Bloom
        intensity={preset.bloomStrength}
        luminanceThreshold={preset.bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      { (isHighQuality ? (
        <ChromaticAberration
          blendFunction={BlendFunction.SCREEN}
          offset={new THREE.Vector2(
            bulletTimeActive ? preset.chromaticAberration * 5 : preset.chromaticAberration * 0.8, 
            bulletTimeActive ? preset.chromaticAberration * 5 : preset.chromaticAberration * 0.8
          )}
        />
      ) : null) as any }

      {swarmActive && (
        <Glitch 
          delay={new THREE.Vector2(0.1, 0.5)} 
          duration={new THREE.Vector2(0.1, 0.3)} 
          strength={new THREE.Vector2(0.3, 1.0)} 
          mode={1} 
          active
          ratio={0.85}
        />
      )}

      {/* AAAA Dithering & Anti-Banding Film Grain */}
      <Noise 
        opacity={bulletTimeActive ? 0.4 : (isHighQuality ? 0.04 : 0.02)} 
        premultiply 
        blendFunction={BlendFunction.SOFT_LIGHT} 
      />

      {/* Focus vignette for cinematic immersion */}
      { (<Vignette 
        eskil={false} 
        offset={0.5} 
        darkness={isCinematic || bulletTimeActive ? 0.8 : 0.4} 
      />) as any }

      {/* Force consistent ACES Filmic mapping across all browsers overriding Brave fuzzing/Chrome HDR explosion */}
      { (<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />) as any }

    </EffectComposer>
  );
}
