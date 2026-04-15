import { useGameStore } from '../../store/useGameStore';

export function EndScreen() {
  const finalScore = useGameStore((state) => state.finalScore);
  const bestCombo = useGameStore((state) => state.bestCombo);
  const setGameState = useGameStore((state) => state.setGameState);

  const handlePlayAgain = () => {
    setGameState('START_SCREEN');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        zIndex: 4000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
      }}
    >
      {/* Main content container */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #00ffff',
          borderRadius: '20px',
          padding: '60px 80px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(0, 255, 255, 0.1)',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#00ffff',
            letterSpacing: '6px',
            marginBottom: '40px',
            textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
          }}
        >
          SESSION COMPLETE
        </div>

        {/* Final Score */}
        <div
          style={{
            fontSize: '32px',
            color: '#ffffff',
            marginBottom: '20px',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          }}
        >
          FINAL SCORE: <span style={{ color: '#00ff00', fontWeight: '900' }}>{finalScore.toLocaleString()}</span>
        </div>

        {/* Best Combo */}
        <div
          style={{
            fontSize: '24px',
            color: '#ff00ff',
            marginBottom: '40px',
            textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
          }}
        >
          BEST COMBO: <span style={{ color: '#ff00ff', fontWeight: '900' }}>x{bestCombo}</span>
        </div>

        {/* Play Again Button */}
        <button
          onClick={handlePlayAgain}
          style={{
            background: 'transparent',
            border: '2px solid #00ffff',
            color: '#00ffff',
            padding: '20px 60px',
            fontSize: '24px',
            fontWeight: '900',
            fontFamily: 'monospace',
            letterSpacing: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px #00ffff',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00ffff';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#00ffff';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
          }}
        >
          [ PLAY AGAIN ]
        </button>
      </div>

      {/* Ambient effects */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '12px',
          color: '#00ffff',
          opacity: '0.6',
          letterSpacing: '2px',
        }}
      >
        VIBEJAM 2026
      </div>
    </div>
  );
}
