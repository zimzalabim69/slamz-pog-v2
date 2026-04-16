import { Component, Suspense, type ReactNode } from 'react';
import * as THREE from 'three';
import { Experience } from './components/Experience';
import { HUD } from './components/ui/HUD';
import { Showcase } from './components/ui/Showcase';
import { StartScreen } from './components/ui/StartScreen';
import { CRTOverlay } from './components/ui/CRTOverlay';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store/useGameStore';
import { DebugPanel } from './components/ui/DebugPanel';
import { PauseMenu } from './components/ui/PauseMenu';
import { PerfectHit } from './components/ui/PerfectHit';
import { SessionSummary } from './components/ui/SessionSummary';

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

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <WebGLErrorBoundary>
        <Canvas 
          shadows={false}
          style={{ background: '#050510' }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: true,
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
      </WebGLErrorBoundary>
      
      {/* CORE GAME UI LAYERS */}
      {gameState === 'START_SCREEN' && <StartScreen />}
      <HUD />
      <Showcase />
      <CRTOverlay />
      
      {/* SYSTEM OVERLAYS */}
      <PauseMenu />
      <PerfectHit />
      <SessionSummary />
      <DebugPanel />
    </div>
  );
}

export default App;
