import { useEffect, useState } from 'react';

export interface DebugParams {
  // Physics - Pog
  pogMass: number;
  pogRestitution: number;
  pogFriction: number;
  pogLinearDamping: number;
  pogAngularDamping: number;
  
  // Physics - Slammer
  slammerMass: number;
  slammerRestitution: number;
  slammerFriction: number;
  slamBaseForce: number;
  slamPowerMultiplier: number;
  shatterRadius: number;
  shatterForceMin: number;
  shatterForceMax: number;
  
  // Visual - Slammer
  slammerOpacity: number;
  slammerScaleBoost: number;
  slammerEmissiveIntensity: number;
  
  // Visual - Pog
  pogScale: number;
  pogRotationSpeed: number;
  pogMetalness: number;
  pogRoughness: number;
  
  // Camera
  baseFOV: number;
  punchFOV: number;
  fovLerpSpeed: number;
  
  // Fog
  fogDensity: number;
  fogNear: number;
  fogFar: number;
  
  // Gameplay
  powerChargeSpeed: number;
  slamDelay: number;
  
  // Start Screen - Logo
  logoScale: number;
  logoPositionX: number;
  logoPositionY: number;
  logoPositionZ: number;
  logoRotationX: number;
  logoRotationY: number;
  logoRotationZ: number;
  
  // Start Screen - Button
  buttonScale: number;
  buttonPositionX: number;
  buttonPositionY: number;
  buttonFontSize: number;
  
  // Arena
  arenaLightIntensity: number;
  arenaAmbientIntensity: number;
  floorPositionY: number;
}

export const DEFAULT_DEBUG_PARAMS: DebugParams = {
  // Physics - Pog
  pogMass: 0.8,
  pogRestitution: 0.05,
  pogFriction: 0.8,
  pogLinearDamping: 0.15,
  pogAngularDamping: 0.25,
  
  // Physics - Slammer
  slammerMass: 1.5,
  slammerRestitution: 0.7,
  slammerFriction: 0.2,
  slamBaseForce: -22,
  slamPowerMultiplier: -0.4,
  shatterRadius: 0.75,
  shatterForceMin: 0.3,
  shatterForceMax: 1.1,
  
  // Visual - Slammer
  slammerOpacity: 0.75,
  slammerScaleBoost: 0.15,
  slammerEmissiveIntensity: 1.5,
  
  // Visual - Pog
  pogScale: 1.0,
  pogRotationSpeed: 0.002,
  pogMetalness: 0.3,
  pogRoughness: 0.7,
  
  // Camera
  baseFOV: 50,
  punchFOV: 65,
  fovLerpSpeed: 0.15,
  
  // Fog
  fogDensity: 0.035,
  fogNear: 1,
  fogFar: 50,
  
  // Gameplay
  powerChargeSpeed: 240,
  slamDelay: 200,
  
  // Start Screen - Logo
  logoScale: 1.0,
  logoPositionX: 0,
  logoPositionY: 0,
  logoPositionZ: 0,
  logoRotationX: 0,
  logoRotationY: 0,
  logoRotationZ: 0,
  
  // Start Screen - Button
  buttonScale: 1.0,
  buttonPositionX: 50, // percentage
  buttonPositionY: 70, // percentage
  buttonFontSize: 24,
  
  // Arena
  arenaLightIntensity: 1.0,
  arenaAmbientIntensity: 0.5,
  floorPositionY: 0,
};

/**
 * Hook to get live debug parameters
 * Components should use this to get real-time updated parameters from the DebugPanel
 */
export function useDebugParams(): DebugParams {
  const [params, setParams] = useState<DebugParams>(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('debugParams');
    if (stored) {
      try {
        return { ...DEFAULT_DEBUG_PARAMS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_DEBUG_PARAMS;
      }
    }
    return DEFAULT_DEBUG_PARAMS;
  });

  useEffect(() => {
    const handleParamsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<DebugParams>;
      setParams(customEvent.detail);
    };

    window.addEventListener('debugParamsChanged', handleParamsChanged);

    return () => {
      window.removeEventListener('debugParamsChanged', handleParamsChanged);
    };
  }, []);

  return params;
}
