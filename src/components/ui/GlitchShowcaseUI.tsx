/**
 * SLAMZ PRO-TOUR: 90s ALTERNATIVE "GLITCH" SHOWCASE
 * Features: Randomized Text Jitter, Neon Aura Glow, and Slime-Vibe UI.
 */
import './GlitchShowcaseUI.css';

export const GlitchShowcaseUI = () => {
  return (
    <div className="absolute inset-0 z-50 p-8 pointer-events-none select-none overflow-hidden">

      {/* 1. THE RADICAL HEADER (Glitching & Glowing) */}
      <div className="absolute top-10 left-10 -rotate-3 animate-jitter">
        <div className="bg-yellow-400 text-black px-10 py-4 border-[6px] border-black shadow-[10px_10px_0_#ff00ff] animate-neon">
          <h1 className="text-8xl font-black italic tracking-tighter leading-none uppercase">
            NINJA <span className="text-white drop-shadow-[6px_6px_0_#000]">TURDLES</span>
          </h1>
        </div>
        <div className="mt-[-15px] ml-16 bg-black text-cyan-400 px-6 py-2 text-2xl font-black italic border-4 border-white shadow-[6px_6px_0_#ff00ff]">
          ULTIMATE_EDITION.exe
        </div>
      </div>

      {/* 2. THE DATA BOX (With Pulsing Aura) */}
      <div className="absolute right-12 top-1/4 w-80 rotate-2 group pointer-events-auto">
        <div className="bg-[#111] border-[5px] border-[#ff00ff] p-8 shadow-[-15px_15px_0_rgba(0,255,255,1)] animate-neon hover:animate-jitter transition-all">
          
          <div className="mb-6 border-b-4 border-yellow-400 pb-2">
             <p className="text-white font-mono text-xs tracking-[0.5em] uppercase font-bold italic">{">> ASSET_INTEL"}</p>
          </div>

          <div className="space-y-6">
            <div className="transform -skew-x-12">
              <p className="text-xs text-cyan-400 font-bold uppercase italic">RATING:</p>
              <p className="text-5xl text-white font-black italic drop-shadow-[4px_4px_0_#ff00ff] leading-none">STANDARD</p>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="transform -skew-x-12">
                <p className="text-xs text-cyan-400 font-bold uppercase italic">VALUE:</p>
                <p className="text-7xl text-yellow-400 font-black italic leading-none drop-shadow-[4px_4px_0_#000]">50</p>
              </div>
              <div className="bg-white text-black p-3 font-black text-4xl h-16 w-16 flex items-center justify-center -rotate-12 border-4 border-black shadow-[4px_4px_0_#ff00ff]">
                P
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-white/20 text-[12px] leading-tight font-black italic text-white uppercase">
            "MORTAL SLAMZ TECH OVERLOAD"<br/>
            LIGHTNING EMISSIVES: <span className="text-cyan-400 animate-pulse">MAXED</span><br/>
            <span className="text-yellow-400 mt-2 block">© 2026 // NO MERCY</span>
          </div>
        </div>
      </div>

      {/* 3. VHS TRACKING OVERLAY */}
      <div className="absolute bottom-6 right-10 text-white/40 font-mono text-xl italic tracking-tighter">
        PLAY ▶ <span className="animate-pulse">00:24:96:SP</span>
      </div>

      {/* 4. SHOWCASE STICKER (Floating & Jittery) */}
      <div className="absolute bottom-12 left-12 animate-jitter">
        <div className="bg-cyan-400 text-black px-8 py-4 font-black italic text-5xl border-[6px] border-black shadow-[10px_10px_0_#ff00ff] -rotate-6">
          SHOWCASE!!
        </div>
      </div>
    </div>
  );
};
