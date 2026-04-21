import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@100/store/useGameStore';
import { GAME_CONFIG } from '@100/constants/gameConfig';

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
   * Treating slamzs as 'actual objects' with continuous collision.
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
    
    // 1. Shift Environment to 'Bullet Time' & HIT-STOP for tactile 'crunch'
    const isPerfect = impactPower >= 98;
    const hitStopDuration = isPerfect ? 120 : 60;
    
    useGameStore.getState().triggerHitStop();
    if (isPerfect) useGameStore.getState().triggerPerfectHit();

    useGameStore.setState({ 
      bulletTimeActive: true,
      globalDampingScale: 1.0 // ABSOLUTE FREEZE
    });

    // Clear hit-stop after duration
    setTimeout(() => {
      useGameStore.setState({ hitStopActive: false, perfectHitActive: false });
    }, hitStopDuration);

    // 2. Schedule the "Explosion" release after freezeDuration
    const freezeDuration = (GAME_CONFIG.CINEMATIC_FREEZE || 0.8) * 1000;
    
    setTimeout(() => {
      if (this.isCinematicActive) {
        useGameStore.setState({
          globalDampingScale: 0.05 // RELEASE: Much lower damping for "pop"
        });
      }
    }, freezeDuration);

    const impactSpeed = (impactPower / 100) * (debugParams?.powerChargeSpeed || GAME_CONFIG.POWER_CHARGE_SPEED);
    const forceBase = slammerMass * impactSpeed * (debugParams?.slamForceMultiplier || GAME_CONFIG.SLAM_FORCE_MULTIPLIER) * 0.035;

    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('slamz-')) {
        const slamzPos = body.translation();
        
        // --- THE VOLCANIC PHYSICS ---
        const dx = slamzPos.x - impactPoint.x;
        const dz = slamzPos.z - impactPoint.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        const eruptionRadius = debugParams?.eruptionRadius || GAME_CONFIG.ERUPTION_RADIUS;
        
        if (dist < eruptionRadius) {
          const jitterX = (Math.random() - 0.5) * 0.4;
          const jitterZ = (Math.random() - 0.5) * 0.4;

          const dirX = (dx / (dist || 0.1)) + jitterX;
          const dirZ = (dz / (dist || 0.1)) + jitterZ;
          const decline = Math.max(0, 1 - dist / eruptionRadius);
          
          const upwardMult = debugParams?.eruptionUpwardMultiplier || GAME_CONFIG.ERUPTION_UPWARD_MULT;
          const airLift = forceBase * decline * upwardMult;
          
          const powerFactor = Math.pow(impactPower / 100, 2.5);
          let radialPush = forceBase * decline * 0.05 * powerFactor; 

          // 75% CONTAINMENT FIELD (Radius 4.5)
          const matLimit = 4.5;
          const distToCenter = Math.sqrt(slamzPos.x * slamzPos.x + slamzPos.z * slamzPos.z);
          if (distToCenter > matLimit - 1.0) {
            const inwardDirX = -slamzPos.x / (distToCenter || 1);
            const inwardDirZ = -slamzPos.z / (distToCenter || 1);
            const strength = Math.max(0, distToCenter - (matLimit - 1.0)) * 0.5;
            body.applyImpulse({ x: inwardDirX * strength, y: 0, z: inwardDirZ * strength }, true);
            radialPush *= 0.2; 
          }
          
          body.setTranslation({ 
            x: slamzPos.x, 
            y: slamzPos.y + 0.15, 
            z: slamzPos.z 
          }, true);
          
          body.applyImpulse({
            x: dirX * radialPush,
            y: airLift,
            z: dirZ * radialPush
          }, true);

          const torqueMult = debugParams?.eruptionTorqueMultiplier || GAME_CONFIG.ERUPTION_TORQUE_MULT;
          const torque = forceBase * decline * torqueMult * 2.0;
          body.applyTorqueImpulse({
            x: (Math.random() - 0.5) * torque,
            y: (Math.random() - 0.5) * torque,
            z: (Math.random() - 0.5) * torque
          }, true);

          body.setBodyType(0, true);
          body.wakeUp();
        }
      }
    });
  }

  public handOff(world: any) {
    if (!world) return;
    
    useGameStore.setState({ 
      bulletTimeActive: false,
      globalDampingScale: 0
    });

    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('slamz-')) {
        body.setLinearDamping(GAME_CONFIG.SLAMZ_LINEAR_DAMPING);
        body.setAngularDamping(GAME_CONFIG.SLAMZ_ANGULAR_DAMPING);
        body.wakeUp();
      }
    });
    
    this.isCinematicActive = false;
    this.justEndedAt = Date.now();
  }

  public reset() {
    this.isCinematicActive = false;
    this.justEndedAt = 0;
    useGameStore.setState({ 
        bulletTimeActive: false,
        globalDampingScale: 0
    });
  }
}

export const cinematicEngine = new CinematicEngine();
