import React from 'react';
import './CSSArcadeIntro.css';
import { DataRain } from './DataRain';

/**
 * CSS ARCADIA CINEMATIC (Pure CSS 3D)
 * 
 * Reconstructs a 3D arcade cabinet and floor using CSS transforms.
 * Moves the 'world' relative to the camera rig to create a floating sensation.
 */
export function CSSArcadeIntro() {
  return (
    <div className="arcade-intro-stage">
      <div className="camera-rig">
        <div className="arcade-world">
          
          {/* GROUND PLANE */}
          <div className="arcade-floor" />
          
          {/* BACK WALL */}
          <div className="arcade-wall" />

          {/* 3D CABINET 01 */}
          <div className="cabinet-group">
            <div className="cabinet-side cabinet-side-left" />
            <div className="cabinet-side cabinet-side-right" />
            
            <div className="cabinet-front-panel">
              <div style={{ padding: '40px', color: '#ff00ff', fontSize: '10px' }}>
                SYSTEM_v2.3_BOOT...
              </div>
            </div>

            <div className="cabinet-screen-bezel">
              <div className="cabinet-screen">
                <DataRain />
              </div>
            </div>

            <div className="cabinet-marquee">
              <div className="marquee-glow" />
              S.L.A.M.Z.
            </div>
            
            {/* Control Panel (Dashboard) */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '100px',
              background: '#0a0a1a',
              transform: 'translate(-50%, -50%) translateY(-100px) translateZ(180px) rotateX(15deg)',
              borderBottom: '4px solid #00ffff',
              boxShadow: '0 5px 20px rgba(0, 255, 255, 0.3)'
            }}>
                <div style={{ display: 'flex', gap: '10px', padding: '20px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ff00ff', boxShadow: '0 0 10px #ff00ff' }} />
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#00ffff', boxShadow: '0 0 10px #00ffff' }} />
                    <div style={{ width: '40px', height: '10px', background: '#333', marginTop: '5px' }} />
                </div>
            </div>
          </div>

          {/* BACKGROUND DECOR - Neon Strips */}
          <div style={{
            position: 'absolute',
            width: '10px',
            height: '2000px',
            background: '#ff00ff',
            boxShadow: '0 0 20px #ff00ff',
            transform: 'translateX(-1000px) translateZ(-500px)'
          }} />
          <div style={{
            position: 'absolute',
            width: '10px',
            height: '2000px',
            background: '#00ffff',
            boxShadow: '0 0 20px #00ffff',
            transform: 'translateX(1000px) translateZ(-500px)'
          }} />

        </div>
      </div>
    </div>
  );
}
