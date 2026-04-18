import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import './PauseMenu.css';

type Tab = 'RESUME' | 'GAMEPLAY' | 'SETTINGS' | 'SYSTEM';

export function PauseMenu() {
  const gameState = useGameStore((s) => s.gameState);
  const togglePause = useGameStore((s) => s.togglePause);
  const toggleBinder = useGameStore((s) => s.toggleBinder);
  const toggleAchievements = useGameStore((s) => s.toggleAchievements);
  const resetGame = useGameStore((s) => s.resetGame);
  const qualityLevel = useGameStore((s) => s.qualityLevel);
  
  const [activeTab, setActiveTab] = useState<Tab>('RESUME');

  // ESC Key listener
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [togglePause]);

  if (gameState !== 'PAUSED') return null;

  const handleAction = (type: string) => {
    if (type === 'BINDER') { togglePause(); toggleBinder(); }
    if (type === 'ACHIEVEMENTS') { togglePause(); toggleAchievements(); }
    if (type === 'RESET') { 
        if (confirm('DATA WIPE: ARREST ALL PROGRESS?')) {
            resetGame();
            togglePause();
        }
    }
  };

  return (
    <div className="pause-overlay">
      <div className="pause-container">
        
        {/* LEFT NAV - TABS */}
        <div className="pause-sidebar">
          <div className="pause-brand">SLAMZ<span>PRO-TOUR</span></div>
          <div className="tab-list">
            <button className={`tab-btn ${activeTab === 'RESUME' ? 'active' : ''}`} onClick={() => setActiveTab('RESUME')}>Overview</button>
            <button className={`tab-btn ${activeTab === 'GAMEPLAY' ? 'active' : ''}`} onClick={() => setActiveTab('GAMEPLAY')}>Gameplay</button>
            <button className={`tab-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`} onClick={() => setActiveTab('SETTINGS')}>Hardware</button>
            <button className={`tab-btn ${activeTab === 'SYSTEM' ? 'active' : ''}`} onClick={() => setActiveTab('SYSTEM')}>System</button>
          </div>
        </div>

        {/* RIGHT CONTENT - DYNAMIC PANEL */}
        <div className="pause-content">
          
          {activeTab === 'RESUME' && (
            <div className="content-panel fade-in">
              <h1 className="panel-title">SYSTEM PAUSED</h1>
              <p className="panel-sub">SESSION ACTIVE | NEON ALLEY ARENA</p>
              
              <div className="quick-actions">
                <button className="big-action-btn primary" onClick={togglePause}>
                  RESUME ARENA
                  <span>BACK TO THE POGS</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'GAMEPLAY' && (
            <div className="content-panel fade-in">
              <h1 className="panel-title">COLLECTIONS</h1>
              <div className="action-grid">
                <button className="grid-btn" onClick={() => handleAction('BINDER')}>
                   OPEN BINDER
                   <span>VIEW YOUR COLLECTION</span>
                </button>
                <button className="grid-btn" onClick={() => handleAction('ACHIEVEMENTS')}>
                   ACHIEVEMENTS
                   <span>TRACK PROGRESS</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="content-panel fade-in">
              <h1 className="panel-title">GRAPHICS & PERFORMANCE</h1>
              
              <div className="setting-row">
                <label>Visual Fidelity</label>
                <div className="toggle-group">
                   <button 
                    className={qualityLevel === 'low' ? 'active' : ''}
                    onClick={() => useGameStore.setState({ qualityLevel: 'low' })}
                   >LOW</button>
                   <button 
                    className={qualityLevel === 'medium' ? 'active' : ''}
                    onClick={() => useGameStore.setState({ qualityLevel: 'medium' })}
                   >MED</button>
                   <button 
                    className={qualityLevel === 'high' ? 'active' : ''}
                    onClick={() => useGameStore.setState({ qualityLevel: 'high' })}
                   >ULTRA</button>
                </div>
              </div>

              <div className="setting-row">
                <label>FPS Limiter</label>
                <div className="toggle-group">
                   <button className="active">NATIVE</button>
                   <button disabled>60</button>
                   <button disabled>30</button>
                </div>
              </div>

              <p className="setting-note">Note: AAAA performance mode requires high-end hardware for 144Hz stability.</p>
            </div>
          )}

          {activeTab === 'SYSTEM' && (
            <div className="content-panel fade-in">
              <h1 className="panel-title">DATA MANAGEMENT</h1>
              <button className="danger-btn" onClick={() => handleAction('RESET')}>
                NUKE ALL DATA
                <span>PERMANENT DELETE</span>
              </button>
              <button className="exit-btn" onClick={() => window.close()}>
                QUIT TO DESKTOP
              </button>
            </div>
          )}
        </div>

      </div>
      
      <div className="pause-scanline"></div>
      <div className="pause-vignette"></div>
    </div>
  );
}
