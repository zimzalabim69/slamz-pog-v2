import { useGameStore } from '../../store/useGameStore';
import { useState } from 'react';

export function SessionSummary() {
  const practiceSession = useGameStore((state) => state.practiceSession);
  const selectedForPractice = useGameStore((state) => state.selectedForPractice);
  const sessionScore = useGameStore((state) => state.sessionScore);
  const gameMode = useGameStore((state) => state.gameMode);
  const gameState = useGameStore((state) => state.gameState);

  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveToCollection = () => {
    setIsSaving(true);
    
    // Add all face-up POGs to permanent collection
    const wonPogs = selectedForPractice.filter(pog => 
      sessionScore.faceUpPogs.includes(pog.id)
    );

    wonPogs.forEach(pog => {
      useGameStore.getState().addToCollection({
        theme: pog.theme,
        rarity: pog.rarity,
        date: new Date().toISOString()
      });
    });

    setTimeout(() => {
      useGameStore.getState().setGameState('AIMING');
      setIsSaving(false);
    }, 2000);
  };

  const handlePlayAgain = () => {
    useGameStore.getState().setGameState('PRACTICE_SELECT');
  };

  return (
    <div className="session-summary" style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2a 0%, #2d2d44 100%)',
        padding: '40px',
        borderRadius: '20px',
        border: '3px solid #00ff00',
        boxShadow: '0 0 30px rgba(0, 255, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ 
          color: '#00ff00', 
          fontSize: '32px', 
          marginBottom: '20px',
          textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
          fontFamily: 'monospace',
        }}>
          PRACTICE COMPLETE
        </h1>

        <div style={{ 
          fontSize: '18px', 
          color: '#ffffff', 
          marginBottom: '30px',
          lineHeight: '1.6',
        }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Mode:</strong> {gameMode === 'NO_RESTACK_CHAOS' ? 'CHAOS' : 'FOR KEEPS'}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Time:</strong> {formatTime(sessionDuration)}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>POGs Flipped:</strong> {sessionScore.totalPogsFlipped} / {selectedForPractice.length}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Best Combo:</strong> {sessionScore.bestCombo}x
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Accuracy:</strong> {accuracy}%
          </div>
          <div style={{ marginBottom: '30px' }}>
            <strong>Final Score:</strong> {sessionScore.totalScore.toLocaleString()}
          </div>
        </div>

        {/* Won POGs Display */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '15px' }}>
            POGS WON ({sessionScore.faceUpPogs.length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
            gap: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {selectedForPractice.filter(pog => sessionScore.faceUpPogs.includes(pog.id)).map(pog => (
              <div key={pog.id} style={{
                background: '#2a2a2a',
                border: '2px solid #444',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  marginBottom: '5px',
                }}>
                  {pog.theme.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: pog.rarity === 'holographic' ? '#ff00ff' : 
                            pog.rarity === 'shiny' ? '#00ff00' : '#ffffff',
                  fontWeight: 'bold',
                }}>
                  {pog.rarity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleSaveToCollection}
            disabled={isSaving}
            style={{
              background: isSaving ? '#666' : '#00ff00',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE TO COLLECTION'}
          </button>
          
          <button
            onClick={handlePlayAgain}
            style={{
              background: '#333',
              color: '#fff',
              border: '2px solid #666',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
