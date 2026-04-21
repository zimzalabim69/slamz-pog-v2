import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { physicsFogBridge } from '@400/systems/PhysicsFogBridge';

/**
 * PHYSICS FOG CONTROLLER
 * Monitors the physics world and feeds disturbance data to the PhysicsFogBridge (Ref-based).
 * This ensures 0 re-renders even when physics data updates at 60fps.
 */
export function PhysicsFogController() {
  const { world } = useRapier();

  useFrame(() => {
    let totalEnergy = 0;
    const allDisturbances: Array<{ pos: [number, number, number], energy: number, color: string }> = [];

    world.forEachRigidBody((body) => {
      const vel = body.linvel();
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
      
      if (speed > 0.1) {
        totalEnergy += speed;
        
        const pos = body.translation();
        const userData = body.userData as any;
        
        // Identify if it's a special glowing POG
        let color = '';
        if (userData?.rarity === 'holographic') color = '#ff00ff';
        else if (userData?.rarity === 'shiny') color = '#00ffff';

        allDisturbances.push({
          pos: [pos.x, pos.y, pos.z],
          energy: speed,
          color
        });
      }
    });

    // Sort by energy and take top 5
    const topDisturbances = allDisturbances
      .sort((a, b) => b.energy - a.energy)
      .slice(0, 5);

    // Write to the Bridge (Native Ref) instead of React Store
    physicsFogBridge.update(totalEnergy, topDisturbances);
  });

  return null;
}
