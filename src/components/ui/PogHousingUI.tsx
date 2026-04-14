import { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { drawPogToCanvas } from '../../utils/TextureGenerator';

/**
 * POG HOUSING UI: 90s Extreme Frame Container
 * Creates a housing/frame structure that contains the POG
 */
export const PogHousingUI = () => {
  const gameState = useGameStore((state) => state.gameState);
  const currentShowcase = useGameStore((state) => state.currentShowcase);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  // POG rotation animation
  useEffect(() => {
    if (!currentShowcase || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const animate = () => {
      rotationRef.current += 0.003;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      ctx.translate(-centerX, -centerY);
      
      const { theme, rarity } = currentShowcase;
      drawPogToCanvas(canvas, 'pog', 'metal', theme, rarity);
      
      ctx.restore();
      
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [currentShowcase]);

  // Only show UI in showcase scene
  if (gameState !== 'SHOWCASE' || !currentShowcase) return null;

  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute inset-0 flex items-center justify-center" style={{
        zIndex: 1, // Put UI behind 3D elements
      }}>
        
        {/* AXIS MARKERS - X, Y, Z center indicators */}
        <div style={{
          position: 'absolute',
          width: '2px',
          height: '60px',
          background: '#FF0000',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <span style={{
            position: 'absolute',
            top: '-20px',
            left: '-10px',
            color: '#FF0000',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}>X</span>
        </div>
        
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '2px',
          background: '#00FF00',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <span style={{
            position: 'absolute',
            top: '-10px',
            right: '-20px',
            color: '#00FF00',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}>Y</span>
        </div>
        
        <div style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          border: '2px solid #0000FF',
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <span style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#0000FF',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}>Z</span>
        </div>

        {/* POG CANVAS - Full POG in center, no frame */}
        <canvas 
          ref={canvasRef}
          width={360}
          height={360}
          style={{
            position: 'absolute',
            width: '360px',
            height: '360px',
            borderRadius: '0px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* TOP BANNER - Above the housing */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%) translateY(-100px)',
          background: 'linear-gradient(135deg, #FACC15 0%, #FFD700 100%)',
          border: '6px solid #000',
          padding: '8px 24px',
          clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)',
          boxShadow: '8px 8px 0px #FF00FF',
        }}>
          <h1 style={{
            fontFamily: 'Impact, sans-serif',
            fontStyle: 'italic bold',
            fontSize: '1.8rem',
            margin: 0,
            lineHeight: 1,
            textTransform: 'uppercase',
            WebkitTextStroke: '2px #000000',
            color: '#FACC15',
            textShadow: '2px 2px 0px #000000',
            letterSpacing: '-1px',
            whiteSpace: 'nowrap',
          }}>
            NINJA <span style={{
              color: '#FFFFFF',
              WebkitTextStroke: '3px #000000',
              textShadow: '3px 3px 0px #000000',
            }}>TURDLES</span>
          </h1>
        </div>

        {/* SIDE DATA PANEL - Right of housing */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(140px) translateY(-50%) rotate(2deg)',
          background: 'rgba(17, 17, 17, 0.95)',
          border: '4px solid #FACC15',
          padding: '16px',
          width: '180px',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), 8px 100%, 0 calc(100% - 8px))',
          boxShadow: '-12px 12px 0px #00FFFF, 6px -6px 0px #FF00FF',
        }}>
          
          <div style={{ borderBottom: '3px solid #FACC15', marginBottom: '12px', paddingBottom: '8px' }}>
            <p style={{
              fontSize: '10px',
              fontFamily: 'Impact, sans-serif',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textShadow: '2px 2px 0px #FF00FF',
              transform: 'skew(-5deg)',
            }}>
              {'>> ASSET_INTEL'}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <p style={{
                fontSize: '10px',
                color: '#00FFFF',
                fontFamily: 'Impact, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '2px 2px 0px #000000',
              }}>RATING:</p>
              <p style={{
                fontSize: '1.8rem',
                fontFamily: 'Impact, sans-serif',
                fontStyle: 'italic bold',
                color: '#FFFFFF',
                textShadow: '3px 3px 0px #FF00FF, -2px -2px 0px #00FFFF',
                letterSpacing: '-1px',
                lineHeight: 0.8,
              }}>{currentShowcase.rarity.toUpperCase()}</p>
            </div>
            
            <div>
              <p style={{
                fontSize: '10px',
                color: '#00FFFF',
                fontFamily: 'Impact, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '2px 2px 0px #000000',
              }}>VALUE:</p>
              <p style={{
                fontSize: '2rem',
                fontFamily: 'Impact, sans-serif',
                fontStyle: 'italic bold',
                color: '#FACC15',
                textShadow: '3px 3px 0px #000000, -1px -1px 0px #FF00FF',
                letterSpacing: '-2px',
                lineHeight: 0.7,
              }}>{currentShowcase.marketValue}</p>
            </div>
          </div>
          
          <div style={{
            marginTop: '12px',
            fontSize: '9px',
            fontFamily: 'Impact, sans-serif',
            color: '#FFFFFF',
            borderTop: '2px solid rgba(255,255,255,0.2)',
            paddingTop: '8px',
            textShadow: '1px 1px 0px #FF00FF',
          }}>
            MORTAL SLAMZ TECH<br/>
            <span style={{ color: '#00FFFF' }}>MAXED</span><br/>
            © 2026
          </div>
        </div>

        {/* BOTTOM STICKER */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%) translateY(80px) rotate(-3deg)',
          background: 'linear-gradient(45deg, #00FFFF 0%, #00CCCC 100%)',
          color: '#000000',
          padding: '6px 16px',
          fontFamily: 'Impact, sans-serif',
          fontSize: '1.2rem',
          fontWeight: '900',
          fontStyle: 'italic',
          border: '6px solid #000000',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 8px), 8px 100%, 0 calc(100% - 8px))',
          textShadow: '2px 2px 0px #FACC15',
          letterSpacing: '-1px',
          boxShadow: '8px 8px 0px #FF00FF',
        }}>
          SHOWCASE!!
        </div>

        {/* VHS EFFECTS */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 3,
        }} />

              </div>
    </Html>
  );
};
