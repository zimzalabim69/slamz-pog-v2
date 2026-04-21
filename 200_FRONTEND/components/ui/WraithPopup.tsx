import { useState, useEffect } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import './WraithPopup.css';

const WRAITH_TAUNTS = {
  early: ["YOU_AR3_3N7R4PP3D", "QU17_WH1L3_YOU_C4N", "7H1$_1$_MY_W0RLD", "D474_H31$7_1MM1N3N7"],
  mid: ["SLAMZ_73CH_1$_0B$0L373", "YOU_F1GH7_PHYNIK$", "I_4M_7H3_C0D3", "B0R1NG_P$YCH0L0GY"],
  late: ["7H3_FL1P_W0N7_H3LP", "YOUR_F1NG3R$_4R3_W34K", "3X7R4C710N_F41LUR3", "YOU_4R3_C0N$UM3D"],
  swarm: ["$Y$73M_FAILUR3", "L0W_P0W3R_P47H371C", "M1$$_D373C73D", "YOU_C4NN07_3$C4P3"],
};

function getWraithTaunt(slamzWon: number, isSwarm: boolean): string {
  let stage: 'early' | 'mid' | 'late' | 'swarm' = 'early';
  if (isSwarm) stage = 'swarm';
  else if (slamzWon > 25) stage = 'late';
  else if (slamzWon > 8) stage = 'mid';

  const pool = WRAITH_TAUNTS[stage];
  let text = pool[Math.floor(Math.random() * pool.length)];
  
  // Glitch effect: randomly swap characters for 1s and 0s
  if (Math.random() > 0.7) {
    text = text.split('').map(c => Math.random() > 0.8 ? (Math.random() > 0.5 ? '1' : '0') : c).join('');
  }
  
  return text;
}

interface PopupInstance {
  id: number;
  x: number;
  y: number;
  taunt: string;
}

export function WraithPopup() {
  const [visible, setVisible] = useState(false);
  const [taunt, setTaunt] = useState("");
  const [instances, setInstances] = useState<PopupInstance[]>([]);

  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);
  const slamzWon = useGameStore((s) => s.slamzOnMat); 
  const throwsRemaining = useGameStore((s) => s.throwsRemaining);

  const swarmActive = useGameStore((s) => s.swarmActive);
  const swarmCount = useGameStore((s) => s.swarmCount);
  const triggerWraithSwarm = useGameStore((s) => s.triggerWraithSwarm);
  const clearSwarm = useGameStore((s) => s.clearSwarm);

  // --- CASCADING SPAWN ENGINE ---
  useEffect(() => {
    if (!swarmActive) {
      if (instances.length > 0) setInstances([]);
      return;
    }

    let spawnCount = 0;
    const maxToSpawn = swarmCount || 8;
    
    const spawnNext = () => {
      if (spawnCount >= maxToSpawn || !swarmActive) return;

      const id = Math.random();
      const newInstance: PopupInstance = {
        id,
        x: 5 + Math.random() * 70,
        y: 5 + Math.random() * 70,
        taunt: getWraithTaunt(slamzWon, true)
      };

      setInstances(prev => [...prev, newInstance]);
      spawnCount++;

      // Staggered reveal: accelerates as more spawn
      const delay = Math.max(100, 500 - (spawnCount * 50));
      setTimeout(spawnNext, delay);

      // Individual Life Cycle (Wave dismissal)
      setTimeout(() => {
        setInstances(prev => prev.filter(inst => inst.id !== id));
      }, 3500 + Math.random() * 1000);
    };

    spawnNext();

    // Cleanup swarm after a set time if it hasn't already
    const globalTimer = setTimeout(() => {
      clearSwarm();
    }, 6000);

    return () => clearTimeout(globalTimer);
  }, [swarmActive, swarmCount, slamzWon, clearSwarm]);

  // Standard Cinematic Taunt Trigger (Triggered at 50% throws remaining)
  useEffect(() => {
    // Only taunt if we've used at least one throw (throwsRemaining <= 2)
    const shouldTaunt = throwsRemaining <= 2;

    if (isCinematicActive && bulletTimeActive && !visible && !swarmActive && shouldTaunt) {
      const newTaunt = getWraithTaunt(slamzWon, false);
      setTaunt(newTaunt);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
    
    if (!isCinematicActive && visible) {
      setVisible(false);
    }
  }, [isCinematicActive, bulletTimeActive, slamzWon, swarmActive, visible, throwsRemaining]); 

  if (!visible && !swarmActive) return null;

  return (
    <div className={`wraith-ui-layer ${swarmActive ? 'total-failure' : ''}`}>
      {/* SWARM INSTANCES */}
      {swarmActive && instances.map((inst, idx) => (
        <div 
          key={inst.id}
          className={`wraith-popup swarm-instance jitter ${instances.length > 6 ? 'meltdown' : ''}`}
          style={{ 
            left: `${inst.x}%`, 
            top: `${inst.y}%`,
            zIndex: 100 + idx,
            animationDelay: `${idx * 0.1}s`
          }}
        >
          <div className="popup-header">ERROR: EXCEPTION_DETECTION</div>
          <div className="popup-body">
            <p className="glitch-text" data-text={inst.taunt}>{inst.taunt}</p>
          </div>
          <div className="popup-footer">HARDWARE_REBOOT_REQUIRED</div>
        </div>
      ))}

      {/* SINGLE CINEMATIC POPUP */}
      {visible && !swarmActive && (
        <div className="wraith-popup central-popup">
          <div className="popup-header">SYSTEM_MESSAGE: FROM_GUARD</div>
          <div className="popup-body">
            <p className="glitch-text" data-text={taunt}>{taunt}</p>
          </div>
          <div className="popup-footer">LIST3N_70_7H3_C0D3</div>
        </div>
      )}

      {/* SCREEN DISTORTION OVERLAY (DURING SWARM) */}
      {swarmActive && <div className="swarm-overlay" />}
    </div>
  );
}
