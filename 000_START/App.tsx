import { Component, Suspense, type ReactNode, useEffect } from 'react';
import * as THREE from 'three';
import { Experience } from '@100/components/Experience';
import { HUD } from '@200/components/ui/HUD';
import { StartScreen } from '@200/components/ui/StartScreen';
import { CRTOverlay } from '@200/components/ui/CRTOverlay';
import { Canvas } from '@react-three/fiber';
import { ENABLE_ANTIALIAS, CANVAS_DPR } from '@500/utils/devicePerformance';
import { useGameStore } from '@100/store/useGameStore';
import { DebugPanel } from '@200/components/ui/DebugPanel';
import { PauseMenu } from '@200/components/ui/PauseMenu';
import { PerfectHit } from '@200/components/ui/PerfectHit';
import { SessionSummary } from '@200/components/ui/SessionSummary';
import { WraithPopup } from '@200/components/ui/WraithPopup';
import { useGLTF } from '@react-three/drei';

// Initialize Draco Decoder to local path for AAAA standalone support
useGLTF.setDecoderPath('./draco/');


// ============================================================
// WEBGL DETECTION & ERROR BOUNDARY
// ============================================================
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; webglSupported?: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, webglSupported: checkWebGLSupport() };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("WebGL Critical Crash:", error);
    console.error("WebGL Support:", this.state.webglSupported);
  }

  render() {
    if (this.state.hasError || !this.state.webglSupported) {
      return (
        <div style={{
          width: '100vw', 
          height: '100vh', 
          background: '#100', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: "'Orbitron', sans-serif",
          color: '#ff4444',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem' }}>
            {!this.state.webglSupported ? 'WEBGL NOT SUPPORTED' : 'WEBGL CRITICAL ERROR'}
          </h1>
          <p style={{ marginTop: '20px', color: '#ffaaaa' }}>
            {!this.state.webglSupported 
              ? 'Your browser does not support WebGL. Try Chrome, Firefox, or Edge.'
              : 'The graphics context was lost or failed to initialize.'}
          </p>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#ff8888' }}>
            <p>🔧 Try: Restart browser | Enable hardware acceleration | Update graphics drivers</p>
            <p>🌐 Test WebGL: <a href="https://webglreport.com" target="_blank" style={{ color: '#ffaa00' }}>webglreport.com</a></p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: '10px 30px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            RETRY SYSTEM BOOT
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { AspectController } from '@200/components/ui/AspectController';

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  const gameState = useGameStore((s) => s.gameState);
  const addDataPacket = useGameStore((s) => s.addDataPacket);

  // Drive the global narrative stream
  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
      addDataPacket(hex);
    }, 1200);
    return () => clearInterval(interval);
  }, [addDataPacket]);

  return (
    <WebGLErrorBoundary>
      <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}>
        <AspectController>
          <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}>
            <Canvas 
              shadows={false}
              dpr={CANVAS_DPR}
              style={{ background: '#050510' }}
              gl={{
                antialias: ENABLE_ANTIALIAS,
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
              }}
            >
              <Suspense fallback={null}>
                {gameState !== 'START_SCREEN' && <Experience />}
              </Suspense>
            </Canvas>
            
            {/* CORE GAME CORE (Constrained) */}
            {gameState === 'START_SCREEN' && <StartScreen />}
          </div>
        </AspectController>

        {/* CORE GLOBAL UI LAYERS (Always Full Screen) */}
        <HUD />
        <CRTOverlay />
        
        {/* SYSTEM OVERLAYS */}
        <PauseMenu />
        <PerfectHit />
        <SessionSummary />
        <DebugPanel />
        <WraithPopup />
      </div>
    </WebGLErrorBoundary>
  );
}

export default App;
