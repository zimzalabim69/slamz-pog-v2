import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import * as THREE from 'three';

import { Canvas, useThree } from '@react-three/fiber';
import { ENABLE_ANTIALIAS, CANVAS_DPR } from '@500/utils/devicePerformance';
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
  
  React.useEffect(() => {
    if (!settled) return;
    const interval = setInterval(() => invalidate(), 3000);
    return () => clearInterval(interval);
  }, [settled, invalidate]);
  
  return null;
}

import { audioManager } from '@500/utils/AudioManager';
import { StartLogo3D } from './StartLogo3D';
import { SlamzWraith } from '@100/components/game/SlamzWraith';
import { DataRain } from './DataRain';
import { CSSArcadeIntro } from './CSSArcadeIntro';
import './WraithPopup.css';

interface GlitchPopup {
  id: string;
  x: number;
  y: number;
  text: string;
  layer: 'front' | 'back';
}

const START_TAUNTS = [
  "1T5 0K 1F U QW1T N0W",
  "G0 T0UCH GR455",
  "HURY... L0L",
  "JU5T 4 G4M3... R1GHT?",
  "W4ST3D T1M3...",
  "SY5T3M F41LUR3",
  "Y0U C4NT 35C4P3",
  "TH15 15 Y0UR N3W H0M3",
];

const POPUP_COLORS = ['popup-cyan', 'popup-magenta', 'popup-purple'];

interface GlitchOverlayProps {
  layer: 'front' | 'back';
  popups: GlitchPopup[];
}

function GlitchOverlayRender({ layer, popups }: GlitchOverlayProps) {
  const filteredPopups = popups.filter(p => p.layer === layer);
  
  return (
    <div className={`wraith-ui-layer ${layer === 'front' ? 'foreground-layer' : 'background-layer'}`} style={{ zIndex: layer === 'front' ? 10 : 2 }}>
      {filteredPopups.map(p => (
        <div 
          key={p.id} 
          className={`wraith-popup jitter ${POPUP_COLORS[Math.floor(Math.random() * POPUP_COLORS.length)]}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: '280px' }}
        >
          <div className="popup-header">WARNING: 3RR0R</div>
          <div className="popup-body">
            <div className="glitch-text" style={{ fontSize: '18px' }} data-text={p.text}>{p.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const StartScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const debugParams = useGameStore((state) => state.debugParams);
  const [zooming, setZooming] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);  

  // --- GLITCH SYSTEM STATE ---
  const [popups, setPopups] = useState<GlitchPopup[]>([]);
  const [intensity, setIntensity] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const checkImpact = setInterval(() => {
      const el = document.querySelector('.start-screen');
      if (el?.classList.contains('logo-impact-shake') && !startTime.current) {
        startTime.current = Date.now();
      }
    }, 100);

    const updateIntensity = setInterval(() => {
      if (startTime.current) {
        const elapsed = Date.now() - startTime.current;
        const newIntensity = Math.min(elapsed / 300000, 1);
        setIntensity(newIntensity);
        
        const el = document.querySelector('.start-screen');
        if (newIntensity > 0.8) el?.classList.add('freaking-out');

        const bg = document.querySelector('.background-corrupted-layer');
        if (newIntensity > 0.9) bg?.classList.add('hardware-meltdown');
      }
    }, 1000);

    const spawnPopup = () => {
      if (!startTime.current) {
        setTimeout(spawnPopup, 1000);
        return;
      }
      const id = Math.random().toString(36).substr(2, 9);
      const newPopup: GlitchPopup = {
        id,
        x: 5 + Math.random() * 80,
        y: 5 + Math.random() * 80,
        text: START_TAUNTS[Math.floor(Math.random() * START_TAUNTS.length)],
        layer: Math.random() > 0.8 ? 'front' : 'back'
      };
      
      setPopups(prev => [...prev, newPopup]);
      
      const duration = (800 + (1 - intensity) * 2000) * 1.15;
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== id));
      }, duration);

      const nextDelay = 18000 * (1 - intensity * 0.75);
      setTimeout(spawnPopup, nextDelay + Math.random() * 2000);
    };

    spawnPopup();

    return () => {
      clearInterval(checkImpact);
      clearInterval(updateIntensity);
    };
  }, [intensity]);

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
      <CSSArcadeIntro />
      
      <div className="background-corrupted-layer">
        <div className="moire-interference" />
        <div className="meltdown-blocks" />
        <GlitchOverlayRender layer="back" popups={popups} />
      </div>
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
          <ambientLight intensity={0.6} />
          <Environment preset="city" />
          
          <pointLight position={[-10, 5, 5]} intensity={6} color="#ff00ff" />
          <pointLight position={[10, 5, 5]} intensity={6} color="#00ffff" />
          <spotLight position={[0, 10, 10]} intensity={3} angle={0.5} penumbra={1} />
          
          <SlamzWraith context="start" />
          <StartLogo3D />
        </Canvas>
      </div>

      <GlitchOverlayRender layer="front" popups={popups} />

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
        VIBEJAM 2026: S.L.A.M.Z. // SYNCHRONIZED LEGACY ARCADE MEMORY ZONE
      </div>

      <div className="crt-overlay" />
      <div className="scanlines" />
    </div>
  );
};