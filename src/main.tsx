import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.tsx'
import { initializeTextureRegistry } from './utils/TextureGenerator'
import { initSystemLogger } from './utils/SystemLogger'

/**
 * INITIALIZATION GUARD (Phase 3: Single Mount)
 * We do not render the React app until the Texture Registry
 * and Physics State are fully populated. 
 * React StrictMode is DISABLED to prevent Rapier unmount crashes.
 */
function Root() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      // 1. Initialize Logger First (Safely)
      try {
        initSystemLogger();
      } catch (e) {
        // Fallback to native console if bridge fails
        console.warn('System Logger Bridge failed to initialize:', e);
      }
      
      console.log("BOOTHING SLAMZ CORE...");
      
      // 2. Race initialization against a safety timeout (10 seconds)
      // Wait for fonts to be ready first to ensure Canvas drawing uses correct typography
      await document.fonts.ready;
      
      const initPromise = initializeTextureRegistry();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Initialization Timeout")), 10000)
      );

      try {
        await Promise.race([initPromise, timeoutPromise]);
        if (mounted) {
          setInitialized(true);
          console.log("Single mount confirmed. Systems active.");
        }
      } catch (err) {
        console.error("Critical Initialization Failure or Timeout:", err);
        // FORCE MOUNT even on failure to avoid total black screen
        if (mounted) {
          setInitialized(true);
          console.warn("Forcing mount despite initialization failure.");
        }
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  if (!initialized) {
    return (
      <div style={{
        width: '100vw', 
        height: '100vh', 
        background: '#000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: "'Orbitron', sans-serif",
        color: '#00ffcc'
      }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '4px' }}>INITIALIZING SLAMZ</h1>
        <div style={{ 
          width: '300px', 
          height: '2px', 
          background: '#111', 
          marginTop: '20px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: '#00ffcc',
            position: 'absolute',
            animation: 'scan 2s infinite linear'
          }}></div>
        </div>
        <p style={{ marginTop: '20px', color: '#555', fontSize: '12px' }}>LOADING TEXTURE REGISTRY & PHYSICS WORLD...</p>
        <style>{`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Phase 3: StrictMode REMOVED for Rapier stability
  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root />)
