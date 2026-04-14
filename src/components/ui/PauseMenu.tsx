import { useGameStore } from '../../store/useGameStore';
import './PauseMenu.css';

export function PauseMenu() {
  const gameState = useGameStore((s) => s.gameState);
  const togglePause = useGameStore((s) => s.togglePause);
  const toggleBinder = useGameStore((s) => s.toggleBinder);
  const toggleAchievements = useGameStore((s) => s.toggleAchievements);
  const resetGame = useGameStore((s) => s.resetGame);

  if (gameState !== 'PAUSED') return null;

  return (
    <div className="pause-overlay">
      <h2 className="pause-title">PAUSED</h2>
      
      <div className="pause-menu-list">
        <button className="pause-btn primary" onClick={togglePause}>
          Resume Game
        </button>
        
        <button className="pause-btn" onClick={() => {
          togglePause();
          toggleBinder();
        }}>
          Collection Binder
        </button>
        
        <button className="pause-btn" onClick={() => {
          togglePause();
          toggleAchievements();
        }}>
          Achievements
        </button>
        
        <button className="pause-btn" style={{ marginTop: '20px', opacity: 0.7 }} onClick={() => {
          if (confirm('Reset all progress and collection?')) {
            resetGame();
            togglePause();
          }
        }}>
          Nuke Data (Reset)
        </button>
      </div>

      <div className="pause-hint">
        PRESS [ESC] TO RESUME
      </div>
    </div>
  );
}
