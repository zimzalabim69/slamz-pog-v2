import * as THREE from 'three';
import { useMemo, useRef, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { useGLTF, Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { SlamzWraith } from '../game/SlamzWraith';

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

function makeNeonSignTexture(text: string, bgColor: string, textColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 512, 128);
  ctx.shadowBlur = 24; ctx.shadowColor = textColor;
  ctx.strokeStyle = textColor; ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.shadowBlur = 30; ctx.fillStyle = textColor;
  ctx.font = 'bold 60px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  return new THREE.CanvasTexture(canvas);
}

const SIGN_TEX_OPEN = makeNeonSignTexture('OPEN 24H', '#0a000a', '#ff007c');
const SIGN_TEX_SLAMZ = makeNeonSignTexture('SLAMZ', '#000a0a', '#00e5ff');

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
        const name = child.name.toLowerCase();
        
        // Ensure everything is visible but calibrated
        child.visible = true; 
        child.castShadow = true;
        child.receiveShadow = true;

        if (name.includes('neon') || name.includes('light') || name.includes('emissive')) {
           if ((child as THREE.Mesh).material) {
             const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
             mat.emissiveIntensity = 2;
           }
        }
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

      {/* BATTLE AREA — Neon Centerpiece — Pure Visual ONLY */}
      {debugParams.battleAreaVisible && (
        <SafeArcadeModel
          url="/assets/glbs/Slamz_Neon_Battle_Area.glb"
          position={[
            debugParams.battleAreaPositionX,
            debugParams.battleAreaPositionY,
            debugParams.battleAreaPositionZ
          ]}
          rotation={[
            debugParams.battleAreaRotationX,
            debugParams.battleAreaRotationY,
            debugParams.battleAreaRotationZ
          ]}
          scale={debugParams.battleAreaScale}
        />
      )}

      {/* FLOOR SKIN — custom overlay */}
      {debugParams.arenaFloorSkinVisible && (
        <SafeArcadeModel
          url={`/assets/${debugParams.arenaFloorSkinAsset}`}
          position={[
            debugParams.arenaFloorSkinPositionX,
            debugParams.arenaFloorSkinPositionY,
            debugParams.arenaFloorSkinPositionZ
          ]}
          rotation={[
            debugParams.arenaFloorSkinRotationX,
            debugParams.arenaFloorSkinRotationY,
            debugParams.arenaFloorSkinRotationZ
          ]}
          scale={debugParams.arenaFloorSkinScale}
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
    </group>
  );
}

