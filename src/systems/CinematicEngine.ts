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
  public justEndedAt: number = 0; // Timestamp of last handOff (ms since epoch)
  public readonly GRACE_PERIOD_MS: number = 500; // Grace period after handOff for settle detection

  /**
   * Returns true if we're within the post-handoff grace period.
   * During this window, settle detection should be suppressed to prevent
   * false-positives from residual bullet-time micro-velocities.
   */
  public isInGracePeriod(): boolean {
    if (this.justEndedAt === 0) return false;
    return (Date.now() - this.justEndedAt) < this.GRACE_PERIOD_MS;
  }

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
    
    // 1. Shift Environment to 'Bullet Time' & FREEZE for anticipation
    useGameStore.setState({ 
      bulletTimeActive: true,
      globalDampingScale: 1.0 // ABSOLUTE FREEZE
    });

    // 2. Schedule the "Explosion" release after freezeDuration
    const freezeDuration = (debugParams.cinematicFreezeDuration || 0.8) * 1000;
    
    setTimeout(() => {
      if (this.isCinematicActive) {
        useGameStore.setState({
          globalDampingScale: 0.05 // RELEASE: Much lower damping for "pop"
        });
        console.log('[ENGINE] 💥 EXPLOSION RELEASED');
      }
    }, freezeDuration);

    const impactSpeed = (impactPower / 100) * debugParams.powerChargeSpeed;
    // CALIBRATION: Massive reduction for 0.1 mass regulation pogs.
    // Aiming for impulses in the 1.0 - 5.0 range rather than 35.0+.
    const forceBase = slammerMass * impactSpeed * debugParams.slamForceMultiplier * 0.035;

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
          
          // TIGHTENING: Radial push now scales more aggressively.
          // Mid-power hits stay clustered; Ultra hits (80%+) explode outward.
          const powerFactor = Math.pow(impactPower / 100, 2.5); // Steeper curve
          const radialPush = forceBase * decline * 0.08 * powerFactor; // Lower baseline
          
          // ANTI-CLIP KICK: Pro-active lift to ensure we aren't snagged in the mat
          body.setTranslation({ 
            x: pogPos.x, 
            y: pogPos.y + 0.05, 
            z: pogPos.z 
          }, true);

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
    this.justEndedAt = Date.now(); // Start grace period for settle detector
  }

  /**
   * Reset the engine completely
   */
  public reset() {
    this.isCinematicActive = false;
    this.justEndedAt = 0; // Clear grace period on full reset
    useGameStore.setState({ 
        bulletTimeActive: false,
        globalDampingScale: 0
    });
  }
}

export const cinematicEngine = new CinematicEngine();
