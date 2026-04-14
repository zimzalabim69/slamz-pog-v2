import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

/**
 * PRO-TOUR SHOWCASE: STABLE EDITION
 * Renders via Drei's Html component to prevent WebGL Context Loss.
 */
export const StableShowcaseUI = () => {
  const gameState = useGameStore((state) => state.gameState);
  const currentShowcase = useGameStore((state) => state.currentShowcase);

  // Only show UI in showcase scene
  if (gameState !== 'SHOWCASE' || !currentShowcase) return null;
  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute inset-0 flex flex-col justify-between p-12 text-white italic font-black">
        
        {/* 1. THE RADICAL HEADER - No complex CSS tags */}
        <div className="flex flex-col transform -rotate-3 select-none pointer-events-none">
          <div 
            style={{ 
              backgroundColor: '#facc15', 
              color: 'black', 
              padding: '1.5rem 3rem',
              border: '6px solid black',
              boxShadow: '12px 12px 0px #ff00ff'
            }}
          >
            <h1 className="text-[10vw] leading-none tracking-tighter">
              NINJA <span className="text-white" style={{ WebkitTextStroke: '2px black' }}>TURDLES</span>
            </h1>
          </div>
          <div className="bg-black text-cyan-400 px-6 py-2 text-2xl -mt-4 ml-10 border-4 border-white self-start">
            ULTIMATE_EDITION.exe
          </div>
        </div>

        {/* 2. THE GRUNGE DATA BOX - Fixed Position */}
        <div className="absolute right-12 top-1/4 w-80 transform rotate-2 pointer-events-auto">
          <div 
            style={{ 
              backgroundColor: '#111', 
              border: '5px solid #ff00ff', 
              padding: '2rem',
              boxShadow: '-15px 15px 0px #00ffff'
            }}
          >
            <div className="border-b-4 border-yellow-400 mb-6 pb-2">
              <p className="text-[10px] font-mono tracking-widest text-white/60 uppercase">{">> ASSET_INTEL"}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-cyan-400 uppercase">RATING:</p>
                <p className="text-5xl drop-shadow-[4px_4px_0_#ff00ff]">{currentShowcase.rarity.toUpperCase()}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-cyan-400 uppercase">VALUE:</p>
                  <p className="text-7xl text-yellow-400 drop-shadow-[4px_4px_0_#000]">{currentShowcase.marketValue}</p>
                </div>
                <div className="bg-white text-black p-2 text-4xl w-14 h-14 flex items-center justify-center border-4 border-black -rotate-12">{currentShowcase.setName[0]}</div>
              </div>
            </div>
            
            <div className="mt-8 text-[11px] border-t border-white/20 pt-4 leading-tight text-white/80">
              MORTAL SLAMZ TECH OVERLOAD<br/>
              © 2026 // SLAM_OR_DIE
            </div>
          </div>
        </div>

        {/* 3. SHOWCASE STICKER */}
        <div className="absolute bottom-10 left-10 transform -rotate-6">
          <div className="bg-cyan-400 text-black px-10 py-6 text-6xl border-[8px] border-black shadow-[12px_12px_0_#ff00ff]">
            SHOWCASE!!
          </div>
        </div>

      </div>
    </Html>
  );
};
