import { useGameStore } from '@100/store/useGameStore';
import { useState } from 'react';

export function SessionSummary() {
  const practiceSession = useGameStore((state) => state.practiceSession);
  const selectedForPractice = useGameStore((state) => state.selectedForPractice);
  const sessionScore = useGameStore((state) => state.sessionScore);
  const gameMode = useGameStore((state) => state.gameMode);
  const gameState = useGameStore((state) => state.gameState);

  const [isProcessing, setIsProcessing] = useState(false);

  if (!practiceSession || gameState !== 'SESSION_SUMMARY') return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sessionDuration = Date.now() - practiceSession.startTime;
  const accuracy = sessionScore.totalPogsFlipped > 0 
    ? Math.round((sessionScore.totalScore / (sessionScore.totalPogsFlipped * 100)) * 100)
    : 100;

  const handleReturnToAlley = () => {
    setIsProcessing(true);
    setTimeout(() => {
      useGameStore.getState().setGameState('AIMING');
      setIsProcessing(false);
    }, 1500);
  };

  const handlePlayAgain = () => {
    useGameStore.getState().setGameState('AIMING');
    useGameStore.getState().resetStack();
  };

  return (
    <div className="session-summary" style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{
        background: '#0a0a0a',
        padding: '40px',
        border: '4px solid #00ffcc',
        boxShadow: '0 0 40px rgba(0, 255, 204, 0.4)',
        maxWidth: '700px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #00ffcc, #ff00ff)',
        }} />

        <h1 style={{ 
          color: '#00ffcc', 
          fontSize: '42px', 
          marginBottom: '30px',
          textShadow: '0 0 20px #00ffcc',
          letterSpacing: '10px',
          fontWeight: 900,
        }}>
          BREACH_SUMMARY
        </h1>

        <div style={{ 
          fontSize: '18px', 
          color: '#ffffff', 
          marginBottom: '40px',
          lineHeight: '2.0',
          textAlign: 'left',
          background: 'rgba(0, 255, 204, 0.05)',
          padding: '20px',
          border: '1px solid rgba(0, 255, 204, 0.2)',
        }}>
          <div>[ MODE ] : {gameMode === 'NO_RESTACK_CHAOS' ? 'SYSTEM_CHAOS' : 'PROTOCOL_STRIKE'}</div>
          <div>[ TIME ] : {formatTime(sessionDuration)}</div>
          <div>[ SHARDS ] : {sessionScore.faceUpPogs.length} RECOVERED</div>
          <div>[ ACCURACY ] : {accuracy}% SYNC</div>
          <div style={{ color: '#ff00ff', fontWeight: 900, marginTop: '10px', fontSize: '24px' }}>
            [ TOTAL_SCORE ] : {sessionScore.totalScore.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={handleReturnToAlley}
            disabled={isProcessing}
            style={{
              background: '#00ffcc',
              color: '#000',
              border: 'none',
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: '900',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.2s',
              boxShadow: '4px 4px 0px #ff00ff',
            }}
          >
            {isProcessing ? 'SYNCHRONIZING...' : 'RESTORE_SESSION'}
          </button>
          
          <button
            onClick={handlePlayAgain}
            style={{
              background: 'transparent',
              color: '#00ffcc',
              border: '2px solid #00ffcc',
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: '900',
              cursor: 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.2s',
            }}
          >
             NEW_BREACH
          </button>
        </div>
      </div>
    </div>
  );
}
