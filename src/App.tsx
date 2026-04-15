import * as React from 'react';
import { Component, Suspense, type ReactNode } from 'react';
import * as THREE from 'three';
import { Experience } from './components/Experience';
import { HUD } from './components/ui/HUD';
import { CRTOverlay } from './components/ui/CRTOverlay';
import { Showcase } from './components/ui/Showcase';
import { MobileControls } from './components/ui/MobileControls';
import { DesktopControls } from './components/ui/DesktopControls';
import { MobileDebugPanel } from './components/ui/MobileDebugPanel';
import { FallbackUI } from './components/ui/FallbackUI';
import { PauseMenu } from './components/ui/PauseMenu';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SystemTerminal } from './components/ui/SystemTerminal';
import { StartScreen } from './components/ui/StartScreen';
import { DebugPanel } from './components/ui/DebugPanel';
import { SessionSummary } from './components/ui/SessionSummary';
import { Binder } from './components/ui/Binder';
import { Achievements } from './components/ui/Achievements';
import { Timer } from './components/ui/Timer';
import { ComboPopup } from './components/ui/ComboPopup';
import { PerfectHit } from './components/ui/PerfectHit';
import { EndScreen } from './components/ui/EndScreen';
import { useMobileDetection } from './hooks/useMobileDetection';
import { useGameStore } from './store/useGameStore';
import { useTerminalStore } from './store/useTerminalStore';
import { Canvas } from '@react-three/fiber';
import './App.css';

// ============================================================
// WEBGL DETECTION & ERROR BOUNDARY
// ============================================================
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || 
               canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl') ||
               canvas.getContext('moz-webgl') ||
               canvas.getContext('webkit-webgl');
    
    if (!gl) return false;
    
    // Test WebGL functionality
    const testContext = gl as WebGLRenderingContext;
    const shader = testContext.createShader(testContext.FRAGMENT_SHADER);
    if (!shader) return false;
    
    return true;
  } catch (e) {
    console.error('WebGL detection failed:', e);
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
  }

  render() {
    if (this.state.hasError || !this.state.webglSupported) {
      return (
        <div className="webgl-error-container">
          <h1 className="webgl-error-title">
            {!this.state.webglSupported ? 'WEBGL NOT SUPPORTED' : 'WEBGL CRITICAL ERROR'}
          </h1>
          <p className="webgl-error-message">
            {!this.state.webglSupported 
              ? 'Your browser does not support WebGL. Try Chrome, Firefox, or Edge.'
              : 'The graphics context was lost or failed to initialize.'}
          </p>
          <div className="webgl-error-tips">
            <p>🔧 Try: Restart browser | Enable hardware acceleration | Update graphics drivers</p>
            <p>Test WebGL: <a href="https://webglreport.com" target="_blank" rel="noopener" className="webgl-error-link">webglreport.com</a></p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="webgl-retry-button"
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
  const gameState = useGameStore((state) => state.gameState);
  const initPogs = useGameStore((state) => state.initPogs);
  const togglePause = useGameStore((state) => state.togglePause);
  const mobileInfo = useMobileDetection();
  const hasInitialized = React.useRef(false);
  
  React.useEffect(() => {
    // ESC Global Listener for Pause
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
      if (e.key === '`') { // Tilde/Backtick
        useTerminalStore.getState().toggleTerminal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  React.useEffect(() => {
    // PROTECTED INIT: One-time system boot
    if (!hasInitialized.current) {
      console.log("System booting: Initializing Pogs...");
      initPogs();
      hasInitialized.current = true;
    }
  }, [initPogs]);

  const qualityLevel = useGameStore((state) => state.qualityLevel);
  
  // Adaptive DPR based on quality tier
  const dpr = React.useMemo(() => {
    const nativeDpr = window.devicePixelRatio;
    const isMobile = window.innerWidth < 768;
    if (qualityLevel === 'low') return 1;
    if (qualityLevel === 'medium') return Math.min(nativeDpr, 1.5);
    return isMobile ? Math.min(nativeDpr, 1.5) : Math.min(nativeDpr, 2);
  }, [qualityLevel]);

  const canvasProps = React.useMemo(() => ({
    gl: {
      antialias: qualityLevel !== 'low',
      alpha: false,
      powerPreference: "high-performance" as const,
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
    }
  }), [qualityLevel]); // Constant for the session to prevent context re-initialization jitter

  // Gate: pause game rendering during start screen but keep mounted
  const showGame = gameState !== 'START_SCREEN';

  return (
    <ErrorBoundary>
      <div className="app-container">
        <WebGLErrorBoundary>
        <Canvas 
          shadows={false}
          className="main-canvas"
          frameloop={showGame ? 'always' : 'never'}
          style={{ display: showGame ? 'block' : 'none' }}
          gl={canvasProps.gl}
          dpr={dpr}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
          onError={(error) => {
            console.error('WebGL error:', error);
          }}
        >
          <Suspense fallback={null}>
            <Experience />
            <Showcase />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
      
      {/* 1:1 PROTOTYPE OVERLAYS — CRT always mounted to avoid pop-in */}
      <CRTOverlay />
      <Timer />
      {(gameState === 'AIMING' || gameState === 'POWERING' || gameState === 'SLAMMED') && <HUD />}
      {(gameState === 'AIMING' || gameState === 'POWERING' || gameState === 'SLAMMED') && <ComboPopup />}
      {(gameState === 'AIMING' || gameState === 'POWERING' || gameState === 'SLAMMED') && <PerfectHit />}
      {showGame && <PauseMenu />}
      {showGame && (mobileInfo.isMobile ? <MobileControls /> : <DesktopControls />)}
      {gameState === 'START_SCREEN' && <StartScreen />}
      {gameState === 'SESSION_SUMMARY' && <EndScreen />}
      <SystemTerminal />
      <MobileDebugPanel />
      <DebugPanel />
      <FallbackUI />
      </div>
    </ErrorBoundary>
  );
}

export default App;

