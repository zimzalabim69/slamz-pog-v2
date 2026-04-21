import { useState, useEffect } from 'react';

interface ProTourIntroProps {
  onStartComplete: () => void;
}

// 1. THE MAIN CONTROLLER
export const ProTourIntro = ({ onStartComplete }: ProTourIntroProps) => {
  const [stage, setStage] = useState('BOOT'); // BOOT -> IDLE -> CHARGING -> PLAYING

  useEffect(() => {
    // Automatic sequence: Boot up for 1.5s, then show "PRESS START"
    const timer = setTimeout(() => setStage('IDLE'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const triggerStart = () => {
    setStage('CHARGING');
    // Power-up duration before the camera "Dives" into the game
    setTimeout(() => {
      setStage('PLAYING');
      onStartComplete();
    }, 1800);
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none select-none font-black italic">
      {/* --- LAYER 1: CRT NOISE & SCANLINES --- */}
      <div className="absolute inset-0 bg-[url('https://giphy.com')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-black pointer-events-none" />

      {/* --- LAYER 2: BOOT SEQUENCE --- */}
      {stage === 'BOOT' && (
        <div className="flex h-full items-center justify-center bg-black">
          <div className="text-cyan-500 font-mono text-sm animate-pulse">
            {'>'} INITIALIZING NEURAL LINK...<br/>
            {'>'} LOADING slamz_ENGINE_V2.0.6...<br/>
            {'>'} SLAMMER CALIBRATION: OK
          </div>
        </div>
      )}

      {/* --- LAYER 3: MAIN MENU (IDLE / CHARGING) --- */}
      {(stage === 'IDLE' || stage === 'CHARGING') && (
        <div className={`flex flex-col h-full justify-between p-16 transition-all duration-700 ${stage === 'CHARGING' ? 'scale-110 blur-sm opacity-50' : 'scale-100'}`}>
          
          {/* HEADER: PRO-TOUR BRANDING */}
          <div className="flex flex-col items-start gap-0">
            <div className="text-[12vw] leading-none text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              SLAMZ<span className="text-cyan-400 drop-shadow-[0_0_50px_#00ffff]">PRO</span>
            </div>
            <div className="flex gap-6 -mt-2 ml-4">
              <div className="bg-cyan-500 text-black px-8 py-1 text-2xl skew-x-[-15deg] shadow-[8px_8px_0_#003333]">
                TOUR 2026
              </div>
              <div className="border-2 border-white/30 text-white px-4 py-1 text-xl font-mono skew-x-[-15deg]">
                ULTIMATE_EDITION
              </div>
            </div>
          </div>

          {/* FOOTER: THE "PRESS START" HOOK */}
          <div className="flex flex-col items-center gap-4 mb-20 pointer-events-auto">
             <button 
                onClick={triggerStart}
                className="group relative px-12 py-4 bg-transparent border-y-4 border-white/10 hover:border-cyan-400 transition-all cursor-pointer"
             >
                <div className={`text-7xl tracking-tighter text-white group-hover:text-cyan-400 transition-colors ${stage === 'CHARGING' ? 'animate-ping' : 'animate-pulse'}`}>
                  {stage === 'CHARGING' ? 'POWERING UP...' : 'PRESS START'}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-cyan-500/50 font-mono text-xs tracking-[0.8em]">
                  [ SYSTEM_READY_FOR_SLAM ]
                </div>
             </button>
          </div>

          {/* SIDEBAR: ANALYTICS (Matching your screenshot) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 border-r-8 border-cyan-500 pr-6 py-12 bg-black/40 backdrop-blur-md italic">
            <div className="text-right">
              <p className="text-cyan-500 text-xs">MARKET VALUE</p>
              <p className="text-white text-4xl">50 <span className="text-cyan-400">P</span></p>
            </div>
            <div className="text-right border-t border-white/10 pt-4">
              <p className="text-cyan-500 text-xs">RARITY LEVEL</p>
              <p className="text-white text-2xl tracking-widest">STANDARD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
