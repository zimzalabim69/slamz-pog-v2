import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

import { audioManager } from '../../utils/AudioManager';
import { LightningBolt } from './LightningBolt';
import { StartLogo3D } from './StartLogo3D';
import { StartBackground3D } from './StartBackground3D';
import { StartSmoke } from './StartSmoke';
import { ArcadeCabinet } from './ArcadeCabinet';
import { SlamzWraith } from '../game/SlamzWraith';
import { Canvas, useThree } from '@react-three/fiber';
import { ENABLE_ANTIALIAS, CANVAS_DPR } from '../../utils/devicePerformance';
import { Environment } from '@react-three/drei';
import './StartScreen.css';

// Reactive FogExp2 that reads debug params every frame
function StartSceneFog() {
  const { scene } = useThree();
  const debugParams = useGameStore((state) => state.debugParams);  
  React.useEffect(() => {
    const color = new THREE.Color(
      debugParams.startFogColorR,
      debugParams.startFogColorG,
      debugParams.startFogColorB
    );
    scene.fog = new THREE.FogExp2(color, debugParams.startFogDensity);
    scene.background = color;
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [
    scene,
    debugParams.startFogDensity,
    debugParams.startFogColorR,
    debugParams.startFogColorG,
    debugParams.startFogColorB,
  ]);
  
  return null;
}

// Throttle render loop after intro animation settles
function RenderController() {
  const invalidate = useThree((s) => s.invalidate);
  const [settled, setSettled] = React.useState(false);  
  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // While not settled, invalidate every frame to keep animation running
  React.useEffect(() => {
    if (settled) return;
    let raf: number;
    const loop = () => {
      invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [settled, invalidate]);
  
  // Once settled, only re-render every 3 seconds for ambient life
  React.useEffect(() => {
    if (!settled) return;
    const interval = setInterval(() => invalidate(), 3000);
    return () => clearInterval(interval);
  }, [settled, invalidate]);
  
  return null;
}

export const StartScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const debugParams = useGameStore((state) => state.debugParams);
  const [zooming, setZooming] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);  
  // Lightning state: tracks active bolts and their positions
  const [activeBolt, setActiveBolt] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const lightningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fractal Lightning Strike Logic
  const triggerLightning = useCallback(() => {
    // Random position around the logo
    const x1 = Math.random() * 100; // SVG space (0-100)
    const y1 = Math.random() * 20;
    const x2 = x1 + (Math.random() - 0.5) * 40;
    const y2 = 80 + Math.random() * 20;

    setActiveBolt({ x1, y1, x2, y2 });
    setIsShaking(true);
    setIsGlitching(true);
    
    audioManager.playSfx('lightning_crack', 0.5);

    // Multi-stage flicker for "Real Ass" feel
    setTimeout(() => {
      setActiveBolt(null); // Short flicker "off"
      setTimeout(() => {
        // Flick back "on" with random offset
        setActiveBolt({ x1: x1 + 2, y1, x2: x2 - 2, y2 });
        setTimeout(() => {
          setActiveBolt(null);
          setIsShaking(false);
          setIsGlitching(false);
        }, 100);
      }, 50);
    }, 150);

    // Next strike randomly (1.5 - 6s for high energy)
    const nextStrike = Math.random() * 4500 + 1500;
    lightningTimer.current = setTimeout(triggerLightning, nextStrike);
  }, []);

  useEffect(() => {
    lightningTimer.current = setTimeout(triggerLightning, 2000);
    return () => {
      if (lightningTimer.current) clearTimeout(lightningTimer.current);
    };
  }, [triggerLightning]);

  const handleStart = useCallback(async () => {
    if (zooming) return;
    if (!hasStartedAudio) {
      await audioManager.init();
      setHasStartedAudio(true);
    }
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 30, 100, 50, 200]);
    }
    audioManager.playSfx('slam_start', 0.9);
    setZooming(true);
    const handleStartGame = () => {
      useGameStore.getState().setGameState('AIMING');
      useGameStore.getState().initPogs();
    };
    setTimeout(handleStartGame, 850);
  }, [setGameState, zooming, hasStartedAudio]);

  return (
    <div 
      className={`start-screen ${zooming ? 'zooming' : ''} ${isShaking ? 'screen-shake' : ''}`} 
      onClick={handleStart}
    >
      <h1 className="sr-only">SLAMZ PRO-TOUR | VIBEJAM 2026</h1>
      <div className="energy-grid" />
      <div className="raster-warp" />
      <div className="crt-overlay" />
      <div className="scanlines" />
      
      <div className="lightning-container">
        <svg className="lightning-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="lightning-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {activeBolt && (
            <LightningBolt 
              startX={activeBolt.x1} startY={activeBolt.y1}
              endX={activeBolt.x2} endY={activeBolt.y2}
              isActive={true}
              intensity={1.5}
            />
          )}
        </svg>
      </div>

      <div className="logo-container-3d">
        <Canvas 
          frameloop="demand"
          dpr={CANVAS_DPR}
          gl={{ outputColorSpace: THREE.SRGBColorSpace, antialias: ENABLE_ANTIALIAS }}
          camera={{ position: [0, 0, 8], fov: 35 }}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}
        >
          <StartSceneFog />
          <RenderController />
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          {/* VIBRANT DUAL LIGHTING (MAGENTA / CYAN) */}
          <pointLight position={[-10, 5, 5]} intensity={12} color="#ff00ff" />
          <pointLight position={[10, 5, 5]} intensity={12} color="#00ffff" />
          <spotLight position={[0, 10, 10]} intensity={5} angle={0.5} penumbra={1} />
          
          <StartBackground3D />
          <StartSmoke />
          <ArcadeCabinet />
          <SlamzWraith />
          <StartLogo3D />
        </Canvas>
      </div>

      <div className={`start-screen-content ${isGlitching ? 'rgb-glitch' : ''}`}>
        <div style={{ height: '30vh' }} /> {/* Spacer for logo area */}
        
        <div 
          className="press-start"
          style={{
            transform: `scale(${debugParams.buttonScale})`
          }}
        >
          PRESS START
        </div>
      </div>

      <div className="branding-footer">
        VIBEJAM 2026: PRO-TOUR
      </div>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="rgb-split">
            <feOffset in="SourceGraphic" dx="-3" dy="1" result="red" />
            <feOffset in="SourceGraphic" dx="3" dy="-1" result="blue" />
            <feBlend in="red" in2="blue" mode="screen" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};