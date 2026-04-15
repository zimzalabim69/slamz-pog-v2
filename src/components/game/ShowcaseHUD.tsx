import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Hud, PerspectiveCamera, Environment, Text, Plane } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import { playWhooshSound } from '../../systems/audio';
import * as THREE from 'three';

/**
 * SHOWCASE HUD 12.0: GLOBAL ATMOSPHERE SYNC
 * Standardizes the 16:9 safe zone and syncs rarity colors with the global Atmospheric Fog.
 */
import { physicsFogBridge } from '../../systems/PhysicsFogBridge';

export function ShowcaseHUD() {
  const currentShowcase = useGameStore((state) => state.currentShowcase);
  const gameState = useGameStore((state) => state.gameState);
  const advanceShowcase = useGameStore((state) => state.advanceShowcase);
  const showcaseRatioMode = useGameStore((state) => state.showcaseRatioMode);
  const setFogColor = useGameStore((state) => state.setFogColor);
  
  const meshRef = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  const { viewport } = useThree();

  // Unified Rotation Time
  const localRotationTime = useRef(0);

  // 16:9 Logic
  const targetAspect = 16 / 9;
  const isSafeMode = showcaseRatioMode === 'safe';
  const screenAspect = viewport.width / viewport.height;
  
  // Effective UI width (either clamped to 16:9 or full viewport)
  const uiWidth = (isSafeMode && screenAspect > targetAspect) 
    ? viewport.height * targetAspect 
    : viewport.width;

  const isRare = currentShowcase?.rarity === 'shiny' || currentShowcase?.rarity === 'holographic';
  const rarityColor = currentShowcase?.rarity === 'holographic' ? '#ff00ff' : isRare ? '#00ffff' : '#ffffff';

  // Sync Fog Color with Rarity on Enter
  useEffect(() => {
    if (gameState === 'SHOWCASE' && currentShowcase) {
      playWhooshSound();
      setFogColor(rarityColor);
    }
    // Restore atmosphere color on exit is handled by the atmosphere presets in the store usually,
    // but we can add a manual restore if needed.
  }, [gameState, currentShowcase, rarityColor, setFogColor]);

  const materials = useMemo(() => {
    if (!currentShowcase) return null;
    return getMaterialFromRegistry('pog', 'metal', currentShowcase.theme, currentShowcase.rarity);
  }, [currentShowcase]);

  useFrame((state, delta) => {
    if (gameState !== 'SHOWCASE') return;

    // Direct Time Injection from Bridge
    localRotationTime.current += delta * physicsFogBridge.bulletTimeScale;

    // 1. POG Rotation/Tilt
    if (meshRef.current) {
        meshRef.current.rotation.y += 0.02 * physicsFogBridge.bulletTimeScale;
        meshRef.current.rotation.x = 1.1 + Math.sin(localRotationTime.current * 1.5) * 0.05;
    }

    if (flashLightRef.current && flashLightRef.current.intensity > 0) {
      flashLightRef.current.intensity = THREE.MathUtils.lerp(flashLightRef.current.intensity, 0, 0.1);
    }
  });

  if (gameState !== 'SHOWCASE' || !currentShowcase) return null;

  return (
    <Hud>
      {/* 1. THE CAMERA */}
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      {/* 2. BACKGROUND DIM (Layered under global fog) */}
      <mesh position={[0, 0, -5]} scale={[viewport.width * 2, viewport.height * 2, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#000" transparent opacity={0.6} />
      </mesh>

      {/* 3. THE LIGHTING */}
      <ambientLight intensity={1.5} />
      <spotLight position={[5, 10, 10]} intensity={150} angle={0.5} penumbra={1} color={rarityColor} />
      <pointLight position={[-5, 5, 5]} intensity={80} color="#00ffff" />

      {/* 4. CONTENT (Restricted to Safe Zone) */}
      <group>
          {/* TOP YELLOW BANNER */}
          <group position={[0, viewport.height / 2 - 0.6, -2]} rotation={[0, 0, -0.01]}>
            <Plane args={[uiWidth + 2, 0.8]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#FACC15" />
            </Plane>
            <group position={[-uiWidth / 2 + 1.5, 0, 0.1]}>
                <Plane args={[2.5, 0.5]} position={[0, 0, 0]}>
                    <meshBasicMaterial color="#000" />
                </Plane>
                <Text position={[0, 0, 0.1]} fontSize={0.25} color="white" fontStyle="italic" fontWeight={900}>NINJA TURDLES</Text>
            </group>
            <Text position={[0, 0, 0.1]} fontSize={0.2} color="#00FFFF" fontStyle="italic">ULTIMATE_EDITION.exe</Text>
          </group>

          {/* DATA BOX */}
          <group position={[-uiWidth / 2 + 0.8, 1.0, -1]}>
            <Text position={[0, 0.4, 0]} fontSize={0.15} color="#FACC15" anchorX="left">RATING:</Text>
            <Text position={[0, 0, 0]} fontSize={0.5} color="#a3ff00" anchorX="left" fontWeight={900} fontStyle="italic">
                {currentShowcase.rarity.toUpperCase()}
            </Text>
            <Text position={[0, -0.6, 0]} fontSize={0.15} color="#FACC15" anchorX="left">VALUE:</Text>
            <Text position={[0, -1.0, 0]} fontSize={0.8} color="#FF00FF" anchorX="left" fontWeight={900} fontStyle="italic">
                {currentShowcase.marketValue}
            </Text>
          </group>

          {/* MIDDLE CYAN BANNER */}
          <group position={[0, -0.2, -2]} rotation={[0, 0, -0.01]}>
            <Plane args={[uiWidth + 2, 0.6]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#00FFFF" />
            </Plane>
            <group position={[-uiWidth / 2 + 1.2, 0.1, 0.1]} rotation={[0, 0, -0.03]}>
                <Plane args={[2.0, 0.4]}><meshBasicMaterial color="#000" /></Plane>
                <Text position={[0, 0, 0.1]} fontSize={0.2} color="#FACC15" fontWeight={900} fontStyle="italic">SHOWCASE!!</Text>
            </group>
          </group>

          {/* VIBE JAM PILL */}
          <group position={[uiWidth / 2 - 1.2, -viewport.height / 2 + 0.8, 1]}>
            <Plane args={[1.8, 0.35]}><meshBasicMaterial color="white" /></Plane>
            <Text position={[0, 0, 0.1]} fontSize={0.12} color="black">Vibe Jam 2026</Text>
          </group>

          {/* THE POG HERO */}
          <group position={[0, -0.5, 0]}>
            <mesh 
                ref={meshRef} 
                material={materials as THREE.Material[]}
                scale={[2.2, 2.2, 2.2]}
                onClick={() => advanceShowcase()}
            >
                <cylinderGeometry args={[0.55, 0.55, 0.09, 32]} />
            </mesh>
          </group>
      </group>

      <Environment preset="city" />
    </Hud>
  );
}
