import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';

/**
 * SLAMZ PRO-TOUR CINEMATIC ENGINE
 * 
 * A professional-grade puppet system for physics-based cinematics.
 * Resolves the "Bullet Time" stability issues by decoupling simulation 
 * from cinematic camera orbits.
 */
class CinematicEngine {
  public manualDriftScale: number = 0; // 0 = freeze, 1 = normal speed
  public isCinematicActive: boolean = false;
  
  // Cinematic Constants for "The Swarm"
  public driftVelocityScale: number = 0.05; // Ultra-slow "Hollywood" drift
  public domeRadius: number = 4.5; // Tighter swarm
  public domeFriction: number = 0.9; 
  
  private snapshots: Map<string, {
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
  }> = new Map();

  /**
   * ATOMIC TRIGGER: Captures state and FREEZES the world immediately.
   * Call this from the Slammer at the exact moment of impact.
   */
  public triggerCinematic(world: any) {
    if (!world) return;
    
    this.snapshots.clear();
    this.isCinematicActive = true;

    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        const id = ud.name.replace('pog-', '');
        const linvel = body.linvel();
        const angvel = body.angvel();
        
        // 1. Capture momentum for the manual drift phase
        this.snapshots.set(id, {
          velocity: new THREE.Vector3(linvel.x, linvel.y, linvel.z),
          angularVelocity: new THREE.Vector3(angvel.x, angvel.y, angvel.z),
          position: new THREE.Vector3().copy(body.translation() as any),
          rotation: new THREE.Quaternion().copy(body.rotation() as any)
        });

        // 2. ATOMIC FREEZE: Stop the physical body instantly 
        // This prevents them from moving while we wait for the React render cycle to pause physics
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    });

    console.log(`[ENGINE] ❄️ ATOMIC FREEZE ENGAGED - ${this.snapshots.size} POGS CAPTURED`);
  }

  /**
   * Get Snapshot: Returns the physical memory of a specific object.
   */
  public getSnapshot(id: string) {
    return this.snapshots.get(id);
  }

  /**
   * Calculate Constrained Drift: Handle "The Swarm" behavior.
   * - Reduces hyper-sonic velocities to "Hollywood" speeds.
   * - Applies drag when approaching the Dome Radius.
   * - Adds a tiny centripetal bias for the orbital look.
   */
  public calculateConstrainedDrift(id: string, currentPos: THREE.Vector3, delta: number) {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) return null;

    // 1. Calculate Base Drift (Nerfed for cinematic scale)
    const drift = snapshot.velocity.clone().multiplyScalar(delta * this.manualDriftScale * this.driftVelocityScale);
    
    // 2. Dome Constraint (Radial Friction)
    const distFromCenter = currentPos.length();
    if (distFromCenter > this.domeRadius) {
      // Exponentially slow down outside the dome
      const overshoot = distFromCenter - this.domeRadius;
      const dragFactor = Math.max(0, 1 - (overshoot * 0.5));
      drift.multiplyScalar(dragFactor * this.domeFriction);
      
      // Add a tiny pull back to center
      const pull = currentPos.clone().normalize().multiplyScalar(-0.01 * delta);
      drift.add(pull);
    }

    // 3. Rotation Drift (Nerfed slightly less as spin looks cool)
    const angDrift = snapshot.angularVelocity.clone().multiplyScalar(delta * this.manualDriftScale * 0.8);

    return { drift, angDrift };
  }

  /**
   * Hand-off: Restores the captured physical state back to the active bodies.
   * Call this when the cinematic ends to resume simulation.
   */
  public handOff(world: any) {
    if (!world) return;

    world.forEachRigidBody((body: RapierRigidBody) => {
      const ud = body.userData as any;
      if (ud?.name?.startsWith('pog-')) {
        const id = ud.name.replace('pog-', '');
        const snapshot = this.snapshots.get(id);
        if (snapshot) {
          // Hand control back to the physics solver with the correct momentum
          body.setLinvel(snapshot.velocity, true);
          body.setAngvel(snapshot.angularVelocity, true);
        }
      }
    });
    
    // Clear and reset
    this.manualDriftScale = 1.0;
    this.isCinematicActive = false;
  }

  /**
   * Reset the engine completely (e.g. on new round)
   */
  public reset() {
    this.snapshots.clear();
    this.manualDriftScale = 1.0;
    this.isCinematicActive = false;
  }
}

export const cinematicEngine = new CinematicEngine();
