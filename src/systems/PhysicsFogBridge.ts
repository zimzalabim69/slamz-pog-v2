import * as THREE from 'three';

/**
 * PHYSICS FOG BRIDGE
 * A static singleton to handle high-frequency physics data (120fps+)
 * without triggering React re-renders. 
 * This prevents the "WebGL Critical Error" caused by hook churn.
 */
class PhysicsFogBridge {
  public energy: number = 0;
  public disturbances: Array<{
    pos: THREE.Vector3;
    energy: number;
    color: THREE.Color;
  }> = Array(5).fill(null).map(() => ({
    pos: new THREE.Vector3(),
    energy: 0,
    color: new THREE.Color('#ffffff')
  }));

  public update(energy: number, topDisturbances: Array<{ pos: [number, number, number], energy: number, color: string }>) {
    this.energy = energy;
    topDisturbances.forEach((d, i) => {
      if (i < 5) {
        this.disturbances[i].pos.set(d.pos[0], d.pos[1], d.pos[2]);
        this.disturbances[i].energy = d.energy;
        this.disturbances[i].color.set(d.color || '#ffffff');
      }
    });
  }
}

export const physicsFogBridge = new PhysicsFogBridge();
