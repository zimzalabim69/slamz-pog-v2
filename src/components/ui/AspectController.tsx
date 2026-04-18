import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function AspectController({ children }: { children: ReactNode }) {
  const aspectRatioMode = useGameStore((s) => s.aspectRatioMode);
  const dataPackets = useGameStore((s) => s.dataPackets);
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({});
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const currentAspect = windowWidth / windowHeight;

      if (aspectRatioMode === 'NATIVE') {
        setContainerStyle({
          width: '100vw',
          height: '100vh',
          left: 0,
          top: 0,
          position: 'absolute'
        });
        setIsWide(false);
        return;
      }

      const targetAspect = aspectRatioMode === '16:9' ? 16 / 9 : 21 / 9;
      setIsWide(currentAspect > targetAspect);

      if (currentAspect > targetAspect) {
        // Window is wider than target (Pillarbox on left/right)
        const newWidth = windowHeight * targetAspect;
        setContainerStyle({
          width: `${newWidth}px`,
          height: '100vh',
          left: `${(windowWidth - newWidth) / 2}px`,
          top: 0,
          position: 'absolute'
        });
      } else {
        // Window is taller than target (Letterbox on top/bottom)
        const newHeight = windowWidth / targetAspect;
        setContainerStyle({
          width: '100vw',
          height: `${newHeight}px`,
          left: 0,
          top: `${(windowHeight - newHeight) / 2}px`,
          position: 'absolute'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatioMode]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000', // Black bars
      overflow: 'hidden',
      position: 'relative',
      zIndex: 0
    }}>
      {/* ── ULTRA-WIDE MARGIN UI ── */}
      {isWide && (
        <>
          {/* Left Margin */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '180px',
            opacity: 0.4,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#00ffcc',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <div style={{ color: '#ff0055', marginBottom: '10px', fontSize: '9px', fontWeight: 'bold' }}>
              BREACH_LOG_LEFT [ SYNCED ]
            </div>
            {dataPackets.map((p, i) => (
              <div key={`L-${p}-${i}`} style={{ marginBottom: '4px', opacity: 1 - i * 0.05 }}>
                NODE_{p}_STATE_OK
              </div>
            ))}
          </div>

          {/* Right Margin */}
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '180px',
            opacity: 0.4,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#00ffcc',
            textAlign: 'right',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <div style={{ color: '#ff0055', marginBottom: '10px', fontSize: '9px', fontWeight: 'bold' }}>
              BREACH_LOG_RIGHT [ ACTIVE ]
            </div>
            {dataPackets.map((p, i) => (
              <div key={`R-${p}-${i}`} style={{ marginBottom: '4px', opacity: 1 - i * 0.05 }}>
                0x{p}_PKT_RCVD
              </div>
            ))}
          </div>

          {/* Bottom Left Corner UI */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            opacity: 0.2,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            color: '#00ffcc',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            OS_VER :: SLAMZ_UNIX_2.4.0<br/>
            KERNEL 5.15.0-76-SYSTEM_WRAITH<br/>
            UPTIME: 1734.22.09
          </div>
        </>
      )}

      <div style={{
        ...containerStyle,
        position: 'absolute',
        overflow: 'hidden',
        backgroundColor: '#000', // Inner game background
      }}>
        {children}
      </div>
    </div>
  );
}
