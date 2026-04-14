import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { Gamepad2 } from 'lucide-react';
import './ExtremeShowcaseUI.css';

/**
 * EXTREME SHOWCASE UI: PIXEL PERFECT RECREATION
 * Matches the user-provided reference image.
 */
export const ExtremeShowcaseUI = () => {
  const gameState = useGameStore((state) => state.gameState);
  const currentShowcase = useGameStore((state) => state.currentShowcase);

  // Only show UI in showcase scene
  if (gameState !== 'SHOWCASE' || !currentShowcase) return null;

  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute inset-0 extreme-showcase-container">
        
        {/* 1. TOP YELLOW BANNER */}
        <div className="trapper-top-banner">
          <div className="flex items-baseline gap-4">
             <div className="trapper-title-box">
               <h1 className="trapper-title-text">NINJA TURDLES</h1>
             </div>
             <span className="trapper-subtitle-text uppercase tracking-widest">
                ULTIMATE_EDITION.exe
             </span>
             <span className="ml-12 text-black/60 font-black italic text-xl tracking-tighter">
                &gt;&gt; MARKET_VALUE
             </span>
          </div>
        </div>

        {/* 2. DATA PANEL (Left Floating) */}
        <div className="trapper-data-box animate-in fade-in slide-in-from-left-12 duration-700">
           <div className="trapper-data-row">
              <p className="trapper-data-label">RATING:</p>
              <p className="trapper-data-value-large trapper-data-value-standard">
                {currentShowcase.rarity.toUpperCase()}
              </p>
           </div>
           
           <div className="trapper-data-row">
              <p className="trapper-data-label">VALUE:</p>
              <p className="trapper-data-value-large trapper-data-value-pink">
                {currentShowcase.marketValue}
              </p>
           </div>

           <div className="mt-8 pt-4 border-t-2 border-white/20">
              <p className="text-white/40 text-[10px] font-mono leading-tight">
                MORTAL SLAMZ EXCLUSIVE EDITION.<br/>
                FEATURING REAL-TIME LIGHTNING EMISSIVES.<br/>
                ESTABLISHED 2026.
              </p>
           </div>
        </div>

        {/* 3. MIDDLE CYAN BAR */}
        <div className="trapper-middle-bar">
           <div className="trapper-showcase-sticker">
              <h2 className="trapper-showcase-text">SHOWCASE!!</h2>
           </div>
        </div>

        {/* 4. VIBE JAM PILL (Bottom Right) */}
        <div className="vibejam-pill">
           <Gamepad2 fill="currentColor" />
           <span>Vibe Jam 2026</span>
        </div>

        {/* SCANLINES & EFFECTS */}
        <div className="extreme-scanlines" />
        
      </div>
    </Html>
  );
};
