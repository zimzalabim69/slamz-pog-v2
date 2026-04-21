export const SimpleGlitchUI = () => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Simple 90s Header */}
      <div className="absolute top-10 left-10" style={{
        transform: 'rotate(-3deg)',
        animation: 'jitter 0.2s infinite'
      }}>
        <div style={{
          backgroundColor: '#ffff00',
          color: '#000',
          padding: '20px 40px',
          border: '6px solid #000',
          boxShadow: '10px 10px 0 #ff00ff',
          filter: 'drop-shadow(0 0 10px #ff00ff)'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1
          }}>
            NINJA <span style={{color: '#fff', textShadow: '6px 6px 0 #000'}}>TURDLES</span>
          </h1>
        </div>
      </div>

      {/* Simple Value Display */}
      <div className="absolute right-12 top-1/4" style={{
        width: '300px',
        transform: 'rotate(2deg)',
        pointerEvents: 'auto'
      }}>
        <div style={{
          backgroundColor: '#111',
          border: '5px solid #ff00ff',
          padding: '30px',
          boxShadow: '-15px 15px 0 rgba(0,255,255,1)',
          filter: 'drop-shadow(0 0 20px #00ffff)'
        }}>
          <div style={{color: '#fff', fontFamily: 'monospace', fontSize: '12px', marginBottom: '20px'}}>
            {'>> ASSET_INTEL'}
          </div>
          <div style={{color: '#00ffff', fontSize: '14px', marginBottom: '10px'}}>RATING:</div>
          <div style={{color: '#fff', fontSize: '3rem', fontWeight: '900', fontStyle: 'italic'}}>STANDARD</div>
          <div style={{color: '#00ffff', fontSize: '14px', marginBottom: '10px', marginTop: '20px'}}>VALUE:</div>
          <div style={{color: '#ffff00', fontSize: '4rem', fontWeight: '900', fontStyle: 'italic'}}>50</div>
        </div>
      </div>

      {/* VHS Overlay */}
      <div className="absolute bottom-6 right-10" style={{
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        fontSize: '18px',
        fontStyle: 'italic'
      }}>
        PLAY ▶ <span style={{animation: 'pulse 1s infinite'}}>00:24:96:SP</span>
      </div>

      {/* Add minimal animations */}
      <style>{`
        @keyframes jitter {
          0%, 100% { transform: rotate(-3deg) translate(0,0); }
          25% { transform: rotate(-3deg) translate(-1px, 1px); }
          50% { transform: rotate(-3deg) translate(1px, -1px); }
          75% { transform: rotate(-3deg) translate(-1px, 0px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
