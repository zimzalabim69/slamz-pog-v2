import { useGameStore } from '@100/store/useGameStore';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';

/**
 * IMPACT LAB SCENE
 * A high-performance, minimalist sandbox for physics tuning.
 * Strips away environmental assets to focus entirely on the collision.
 */
export function ImpactLab() {
  const debugParams = useGameStore((state) => state.debugParams);
  const floorY = debugParams.floorPositionY || -0.01;

  return (
    <>
      <ambientLight intensity={0.4 * debugParams.arenaAmbientIntensity} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={2.0 * debugParams.arenaLightIntensity} 
        color="#00ffff" 
      />
      <pointLight 
        position={[-10, 5, -10]} 
        intensity={1.5 * debugParams.arenaLightIntensity} 
        color="#ff00ff" 
      />
      
      {/* GRID FLOOR - High visibility for physics layout */}
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        cellSize={1}
        sectionSize={5}
        sectionColor="#00ffff"
        cellColor="#1a1a2e"
        position={[0, floorY - 0.01, 0]}
      />

      {/* MINIMAL MAT - Represents the playing surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <circleGeometry args={[9, 32]} />
        <meshStandardMaterial 
          color="#0a0a1a"
          transparent
          opacity={0.8}
          emissive="#00ffff"
          emissiveIntensity={0.2 * debugParams.arenaLightIntensity}
        />
      </mesh>
      
      {/* Invisible baseline collider for Lab mode stability */}
      <RigidBody type="fixed" colliders={false} position={[0, floorY, 0]}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.05, 0]} />
      </RigidBody>

      {/* LAB NOTATION */}
      <group position={[0, -0.02, 10]}>
         {/* Could add 3D text here later saying "IMPACT LAB V1.0" */}
      </group>
    </>
  );
}



