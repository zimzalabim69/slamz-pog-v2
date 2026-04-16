import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';

/**
 * SLAMZ PRO-TOUR CINEMATIC ENGINE
 * 
 * A professional-grade puppet system for physics-based cinematics.
 * Resolves the 'Bullet Time' stability issues by decoupling simulation 
 * from cinematic camera orbits.
 */
class CinematicEngine {
  public isCinematicActive: boolean = false;

  /**
   * VOLCANIC TRIGGER: Shifts environment to Zero-G/Slow-Mo and applies impulses.
   * Treating pogs as 'actual objects' with continuous collision.
   */
  public triggerCinematic(
    world: any, 
    impactPoint: THREE.Vector3 | { x: number, y: number, z: number }, 
    impactPower: number, 
    slammerMass: number, 
    debugParams: any
  ) {
    if (!world) return;
    
    this.isCinematicActive = true;
    
    // 1. Shift Environment to 'Bullet Time'
    useGameStore.setState({ 
      bulletTimeActive: true,
      globalDampingScale: 0.98 // ULTRA-THICK AIR (Containment)
    });

    const impactSpeed = (impactPower / 100) * debugParams.powerChargeSpeed;
    // CALIBRATION: Reduced base force to 'Teenage Boy' levels (90s Accuracy)
    const forceBase = slammerMass * impactSpeed * debugParams.slamForceMultiplier * 0.12;

    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        const pogPos = body.translation();
        
        // --- THE VOLCANIC PHYSICS ---
        const dx = pogPos.x - impactPoint.x;
        const dz = pogPos.z - impactPoint.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < debugParams.eruptionRadius) {
          // CHAOS INJECTION: Add random 'Jitter' to the blast vector
          const jitterX = (Math.random() - 0.5) * 0.4;
          const jitterZ = (Math.random() - 0.5) * 0.4;

          const dirX = (dx / (dist || 0.1)) + jitterX;
          const dirZ = (dz / (dist || 0.1)) + jitterZ;
          const decline = Math.max(0, 1 - dist / debugParams.eruptionRadius);
          
          // 1. Air Wedge Effect (Upward + Radial Lift)
          const airLift = forceBase * decline * debugParams.eruptionUpwardMultiplier;
          const radialPush = forceBase * decline * 0.15; // HEAVILY BIASED UPWARD
          
          body.applyImpulse({
            x: dirX * radialPush,
            y: airLift,
            z: dirZ * radialPush
          }, true);

          // 2. Tumble Mechanics (Torque) - Increased for 'flipping'
          const torque = forceBase * decline * debugParams.eruptionTorqueMultiplier * 2.0;
          body.applyTorqueImpulse({
            x: (Math.random() - 0.5) * torque,
            y: (Math.random() - 0.5) * torque,
            z: (Math.random() - 0.5) * torque
          }, true);

          // Ensure bodies are dynamic and awake
          body.setBodyType(0, true);
          body.wakeUp();
        }
      }
    });

    console.log('[ENGINE] 🌋 VOLCANIC TRIGGER ACTIVE - CALIBRATED POWER');
  }

  /**
   * Hand-off: FULL RELEASE - restore normal physics completely.
   */
  public handOff(world: any) {
    if (!world) return;
    
    const debugParams = useGameStore.getState().debugParams;
    
    // FULL RELEASE - remove ALL constraints
    useGameStore.setState({ 
      bulletTimeActive: false,
      globalDampingScale: 0
    });

    // CRITICAL: Reset damping on all pog bodies back to normal!
    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        // Restore normal damping values (the 0.98 bullet-time damping is stuck on them!)
        body.setLinearDamping(debugParams.pogLinearDamping);
        body.setAngularDamping(debugParams.pogAngularDamping);
        body.wakeUp();
      }
    });

    console.log('[ENGINE] 🌍 FULL RELEASE - DAMPING CLEARED - POGS FREE');
    
    this.isCinematicActive = false;
  }

  /**
   * Reset the engine completely
   */
  public reset() {
    this.isCinematicActive = false;
    useGameStore.setState({ 
        bulletTimeActive: false,
        globalDampingScale: 0
    });
  }
}

export const cinematicEngine = new CinematicEngine();
