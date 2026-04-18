// @ts-nocheck
import { useControls, folder } from 'leva';
import { useGameStore } from '../store/useGameStore';
import { useEffect } from 'react';

/**
 * LEVA CONTROLLER
 * Professional-grade tuning suite for SLAMZ PRO-TOUR.
 * Collapsible, development-only, and live-wired to GameStore.
 */
export function LevaController() {
  const debugParams = useGameStore((s) => s.debugParams);
  const setDebugParams = useGameStore((s) => s.setDebugParams);
  const physicsDebug = useGameStore((s) => s.physicsDebug);
  const togglePhysicsDebug = useGameStore((s) => s.togglePhysicsDebug);
  
  // 1. PHYSICS CONTROLS
  const [, setPhysics] = useControls(() => ({
    Physics: folder({
      physicsDebug: {
        value: physicsDebug,
        label: 'Show Wireframes (D)',
        onChange: (v) => {
          if (v !== useGameStore.getState().physicsDebug) togglePhysicsDebug();
        }
      },
      pogMass: {
        value: debugParams.pogMass,
        min: 0.1, max: 10, step: 0.1,
        label: 'Pog Mass',
        onChange: (v) => setDebugParams({ pogMass: v })
      },
      slammerMass: {
        value: debugParams.slammerMass,
        min: 0.5, max: 20, step: 0.5,
        label: 'Slammer Mass',
        onChange: (v) => setDebugParams({ slammerMass: v })
      },
      pogFriction: {
        value: debugParams.pogFriction,
        min: 0, max: 1, step: 0.05,
        label: 'Pog Friction',
        onChange: (v) => setDebugParams({ pogFriction: v })
      },
      slamForceMultiplier: {
        value: debugParams.slamForceMultiplier || 1.0,
        min: 0.1, max: 5.0, step: 0.1,
        label: 'Slam Power',
        onChange: (v) => setDebugParams({ slamForceMultiplier: v })
      }
    }, { collapsed: false })
  }), [debugParams, physicsDebug]);

  // Sync physicsDebug back to Leva if toggled via keyboard
  useEffect(() => {
    setPhysics({ physicsDebug });
  }, [physicsDebug, setPhysics]);

  // 2. KINETIC / BULLET TIME CONTROLS
  useControls(() => ({
    'Cinematics & Time': folder({
      bulletTimeScale: {
        value: useGameStore.getState().bulletTimeScale,
        min: 0, max: 1, step: 0.01,
        label: 'Bullet Time Scale',
        onChange: (v) => useGameStore.setState({ bulletTimeScale: v })
      },
      globalDampingScale: {
        value: useGameStore.getState().globalDampingScale,
        min: 0, max: 1, step: 0.01,
        label: 'Global Damping',
        onChange: (v) => useGameStore.setState({ globalDampingScale: v })
      },
      eruptionRadius: {
        value: debugParams.eruptionRadius || 3.5,
        min: 1, max: 10, step: 0.5,
        label: 'Eruption Radius',
        onChange: (v) => setDebugParams({ eruptionRadius: v })
      }
    }, { collapsed: true })
  }), [debugParams]);

  // 3. VISUALS & EFFECTS
  useControls(() => ({
    'Visuals & Environment': folder({
      fogDensity: {
        value: debugParams.fogDensity,
        min: 0, max: 0.1, step: 0.001,
        label: 'Fog Density',
        onChange: (v) => setDebugParams({ fogDensity: v })
      },
      bloomStrength: {
        value: debugParams.bloomStrength || 1.2,
        min: 0, max: 5, step: 0.1,
        label: 'Bloom Strength',
        onChange: (v) => setDebugParams({ bloomStrength: v })
      }
    }, { collapsed: true })
  }), [debugParams]);

  // 4. PERFORMANCE & ADAPTIVE QUALITY
  useControls(() => ({
    'Performance Monitor': folder({
      qualityLevel: {
        value: useGameStore.getState().qualityLevel,
        options: ['low', 'medium', 'high'],
        label: 'Manual Quality',
        onChange: (v) => useGameStore.setState({ qualityLevel: v as any })
      }
    }, { collapsed: true })
  }));

  return null;
}
