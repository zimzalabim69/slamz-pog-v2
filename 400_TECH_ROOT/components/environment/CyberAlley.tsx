import * as THREE from 'three';
import { useMemo, useRef, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import { useGLTF } from '@react-three/drei';
import { SlamzWraith } from '@100/components/game/SlamzWraith';

// THE EXACT GHOST WIREFRAME MATERIAL
const ghostWireframeMat = new THREE.MeshBasicMaterial({
  color: '#00ffff',
  wireframe: true,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

/**
 * Silent Error Boundary
 * Prevents a single failing GLB load from crashing the entire Three.js context.
 */
class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.warn('Asset load failed (silently caught):', error); }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ArcadeModel({ 
  url,
  position, 
  rotation, 
  scale 
}: { 
  url: string;
  position: [number, number, number]; 
  rotation: [number, number, number];
  scale: number;
}) {
  const { scene } = useGLTF(url);
  
  const cleanedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        // FORCE THE WIREFRAME VIBE ON EVERYTHING
        (child as THREE.Mesh).material = ghostWireframeMat;
        child.visible = true;
      }
    });
    return clone;
  }, [scene]);
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={cleanedScene} />
    </group>
  );
}

// Wrapper to ensure ErrorBoundary catches useGLTF errors
function SafeArcadeModel(props: any) {
  return (
    <SilentErrorBoundary>
      <Suspense fallback={null}>
        <ArcadeModel {...props} />
      </Suspense>
    </SilentErrorBoundary>
  );
}

export function CyberAlley() {
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const debugParams = useGameStore((state) => state.debugParams);
  
  return (
    <group>
      {/* WHOLE ROOM BACKDROP */}
      {debugParams.arenaRoomVisible && (
        <SafeArcadeModel
          url={`/assets/${debugParams.arenaRoomAsset}`}
          position={[
            debugParams.arenaRoomPositionX,
            debugParams.arenaRoomPositionY,
            debugParams.arenaRoomPositionZ
          ]}
          rotation={[
            debugParams.arenaRoomRotationX,
            debugParams.arenaRoomRotationY,
            debugParams.arenaRoomRotationZ
          ]}
          scale={debugParams.arenaRoomScale}
        />
      )}

      {/* ARENA WRAITH — floating player avatar */}
      {qualityLevel !== 'low' && debugParams.wraithArenaVisible && (
        <SlamzWraith context="arena" />
      )}


      {/* GAME OVER ARCADE — Specific Prop */}
      {debugParams.gameOverArcadeVisible && (
        <SafeArcadeModel
          url="/assets/glbs/Game_Over_Arcade.glb"
          position={[
            debugParams.gameOverArcadePositionX,
            debugParams.gameOverArcadePositionY,
            debugParams.gameOverArcadePositionZ
          ]}
          rotation={[
            debugParams.gameOverArcadeRotationX,
            debugParams.gameOverArcadeRotationY,
            debugParams.gameOverArcadeRotationZ
          ]}
          scale={debugParams.gameOverArcadeScale}
        />
      )}

      {/* 3D ARENA LOGO — Giant Landmark */}
      {debugParams.arenaLogoVisible && (
        <SafeArcadeModel
          url="/assets/glbs/slamz_logo.glb"
          position={[
            debugParams.arenaLogoPositionX,
            debugParams.arenaLogoPositionY,
            debugParams.arenaLogoPositionZ
          ]}
          rotation={[
            debugParams.arenaLogoRotationX,
            debugParams.arenaLogoRotationY,
            debugParams.arenaLogoRotationZ
          ]}
          scale={debugParams.arenaLogoScale}
        />
      )}

      {/* DUAL ARCADE CABINETS */}
      {debugParams.arcadeCabinetVisible && (
        <SafeArcadeModel
          url="/assets/glbs/Slamz_Pro_Tour_Arcade.glb"
          position={[
            debugParams.arcadeCabinetPositionX,
            debugParams.arcadeCabinetPositionY,
            debugParams.arcadeCabinetPositionZ
          ]}
          rotation={[0, debugParams.arcadeCabinetRotationY, 0]}
          scale={debugParams.arcadeCabinetScale}
        />
      )}

      {debugParams.arcadeBackVisible && (
        <SafeArcadeModel
          url="/assets/glbs/Slamz_Pro_Tour_Arcade.glb"
          position={[
            debugParams.arcadeBackPositionX,
            debugParams.arcadeBackPositionY,
            debugParams.arcadeBackPositionZ
          ]}
          rotation={[0, debugParams.arcadeBackRotationY, 0]}
          scale={debugParams.arcadeBackScale}
        />
      )}

      {/* DYNAMIC POWER SURGE LIGHTS */}
      <SurgeController />
    </group>
  );
}

import { physicsFogBridge } from '@400/systems/PhysicsFogBridge';
import { useFrame } from '@react-three/fiber';

function SurgeController() {
  const lightRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const energy = physicsFogBridge.energy;
    const flicker = 0.8 + Math.random() * 0.4;
    
    // Dim ambient light when energy is high (Power drain)
    if (ambientRef.current) {
      const targetIntensity = energy > 1000 ? 0.1 : 0.4;
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetIntensity * flicker, 0.2);
    }

    // Flicker main light
    if (lightRef.current) {
      const surgeIntensity = energy > 500 ? 50 * flicker : 1;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, surgeIntensity, 0.2);
    }
  });

  // MeshBasicMaterial is unlit, so we don't need real lights anymore.
  return null;
}
