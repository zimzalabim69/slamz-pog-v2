import React, { useEffect, useState, Suspense } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useGLTF, Float, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const WRAITH_TAUNTS = {
  early: ["U TH1NK UR SP3C14L?", "1 W4S H3R3 B3F0R3 U", "K33P SL4MM1NG..."],
  mid: ["WHY D0 Y0U F1GHT?", "W3 4R3 N0T S0 D1FF3R3NT", "Y0U 4R3 TH3 V1RUS"],
  late: ["1F Y0U W1N... WH4T H4PP3NS T0 M3?", "T00 L4T3 T0 P4TCH M3"],
};

function getWraithTaunt(stats: any): string {
  let stage: 'early' | 'mid' | 'late' = 'early';
  if (stats.pogsWon > 25) stage = 'late';
  else if (stats.pogsWon > 8) stage = 'mid';

  const pool = WRAITH_TAUNTS[stage];
  let text = pool[Math.floor(Math.random() * pool.length)];

  text = text.replace(/A/gi, '4').replace(/E/gi, '3').replace(/I/gi, '1')
            .replace(/O/gi, '0').replace(/S/gi, '$').replace(/T/gi, '7');

  return text.toUpperCase();
}

function WraithGhost() {
  const { scene } = useGLTF('/assets/glbs/Slamz_Wraith.glb');
  
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.6;
        child.material.blending = THREE.AdditiveBlending; // Use Additive Blending for the ghost!
        child.material.emissiveIntensity = 2;
        child.material.color.set('#00ffff');
        child.material.emissive.set('#00ffff');
      }
    });
  }, [scene]);

  return (
    <Float speed={6} rotationIntensity={2} floatIntensity={1.5}>
      <primitive object={scene.clone()} scale={2.4} position={[0, -0.6, 0]} />
    </Float>
  );
}

export function WraithPopup() {
  const [visible, setVisible] = useState(false);
  const [taunt, setTaunt] = useState("");

  const isCinematicActive = useGameStore((s) => s.isCinematicActive);
  const bulletTimeActive = useGameStore((s) => s.bulletTimeActive);
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    if (isCinematicActive && bulletTimeActive && !visible) {
      const newTaunt = getWraithTaunt(stats);
      setTaunt(newTaunt);
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 3800);
      return () => clearTimeout(timer);
    }
  }, [isCinematicActive, bulletTimeActive, visible, stats]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -60%)',
      zIndex: 99999,
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes wraith-vibe-glitch {
          0% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(15deg) brightness(1.3); }
          100% { filter: hue-rotate(0deg) brightness(1); }
        }
        .wraith-blend-frame {
          width: 800px;
          height: 600px;
          background: url('/assets/images/wraith_frame.png') no-repeat center center;
          background-size: contain;
          mix-blend-mode: plus-lighter; /* ADDITIVE BLEND MODE for high-end neon looks */
          position: relative;
          animation: wraith-vibe-glitch 0.2s infinite;
        }
        .wraith-overlay-content {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          mix-blend-mode: normal; /* Keep text readable */
        }
        .wraith-title-text {
          font-family: 'Orbitron', sans-serif;
          font-weight: 950;
          letter-spacing: 14px;
          color: #00ffff;
          font-size: 84px;
          margin-bottom: 2px;
          text-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        }
        .wraith-subtitle-text {
          font-family: 'Orbitron', sans-serif;
          font-weight: 950;
          letter-spacing: 8px;
          color: #ff00ff;
          font-size: 54px;
          margin-bottom: 50px;
          text-shadow: 0 0 30px #ff00ff;
        }
        .wraith-glitch-taunt {
          font-family: 'Share Tech Mono', monospace;
          background: rgba(0,0,0,0.85);
          border: 1px solid #ff00ff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
          padding: 24px 50px;
          color: #ff00ff;
          font-size: 32px;
          letter-spacing: 6px;
          text-align: center;
          max-width: 85%;
          line-height: 1.4;
          text-shadow: 0 0 10px #ff00ff;
        }
        .wraith-3d-ghost {
          position: absolute;
          inset: 0;
          z-index: 50;
        }
      `}</style>

      <div className="wraith-blend-frame">
        {/* 3D Ghost Layer */}
        <div className="wraith-3d-ghost">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <ambientLight intensity={2} />
              <pointLight position={[5, 5, 5]} intensity={4} color="#00ffff" />
              <WraithGhost />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>

        {/* Content Overlays */}
        <div className="wraith-overlay-content">
          <div className="wraith-title-text">WRAITH</div>
          <div className="wraith-subtitle-text">AWAKENED</div>
          
          <div className="wraith-glitch-taunt">
            {taunt}
          </div>

          <div style={{
            marginTop: '34px',
            color: '#00ffff',
            fontSize: '14px',
            letterSpacing: '5px',
            fontFamily: "'Share Tech Mono', monospace",
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ffff'
          }}>
            SYSTEM COMPROMISED • SLAMZ PROTOCOL LIVE
          </div>
        </div>
      </div>
    </div>
  );
}
