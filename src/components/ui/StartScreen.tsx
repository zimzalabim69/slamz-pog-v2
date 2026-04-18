import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

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
    // REMOVED scene.background = color to prevent Chromium opaque compositor fighting
    scene.background = null; 
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

// ─── Responsive FOV Logic (AAAA Responsive Standard) ────────────────
function ResponsiveLens() {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  
  React.useEffect(() => {
    if (camera.type === 'PerspectiveCamera') {
      const pCam = camera as THREE.PerspectiveCamera;
      const targetHFOV = 65; // Horizontal target
      const vFOV = 2 * Math.atan(Math.tan((targetHFOV / 2) * Math.PI / 180) / aspect) * 180 / Math.PI;
      pCam.fov = vFOV;
      pCam.updateProjectionMatrix();
    }
  }, [aspect, camera]);
  
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

import { audioManager } from '../../utils/AudioManager';
import { StartLogo3D } from './StartLogo3D';
import { SlamzWraith } from '../game/SlamzWraith';
import { DataRain } from './DataRain';

export const StartScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const debugParams = useGameStore((state) => state.debugParams);
  const [zooming, setZooming] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);  

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
      className={`start-screen ${zooming ? 'zooming' : ''}`} 
      onClick={handleStart}
    >
      <DataRain />
      <h1 className="sr-only">SLAMZ PRO-TOUR | VIBEJAM 2026</h1>

      <div className="logo-container-3d" style={{ background: 'transparent' }}>
        <Canvas 
          frameloop="always"
          dpr={CANVAS_DPR}
          gl={{ 
            outputColorSpace: THREE.SRGBColorSpace, 
            antialias: ENABLE_ANTIALIAS,
            alpha: true, 
            powerPreference: "high-performance"
          }}
          camera={{ position: [0, 0, 8], fov: 35 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            // Force clear color to 0 alpha
            gl.setClearColor(0x000000, 0);
          }}
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
          <ResponsiveLens />
          <RenderController />
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          {/* VIBRANT DUAL LIGHTING (MAGENTA / CYAN) */}
          <pointLight position={[-10, 5, 5]} intensity={12} color="#ff00ff" />
          <pointLight position={[10, 5, 5]} intensity={12} color="#00ffff" />
          <spotLight position={[0, 10, 10]} intensity={5} angle={0.5} penumbra={1} />
          
          <SlamzWraith context="start" />
          <StartLogo3D />
        </Canvas>
      </div>

      <div 
        className={`press-start ${zooming ? 'zooming-out' : ''}`}
        style={{
          position: 'absolute',
          left: `${debugParams.buttonPositionX}%`,
          top: `${debugParams.buttonPositionY}%`,
          transform: `translate(-50%, -50%) scale(${debugParams.buttonScale})`,
          fontSize: `${debugParams.buttonFontSize}px`,
          zIndex: 100,
          margin: 0
        }}
      >
        PRESS START
      </div>

      <div className="branding-footer">
        VIBEJAM 2026: PRO-TOUR
      </div>

    </div>
  );
};