import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { DebugParams } from '../../store/useGameStore';
import { DEFAULT_DEBUG_PARAMS } from '../../store/useGameStore';
import { EnhancedSlider } from './EnhancedSlider';
import { BooleanToggle } from './BooleanToggle';
import './DebugPanel.css';
import './EnhancedSlider.css';
import './BooleanToggle.css';

type TabType = 
  | 'physics' | 'visual' | 'camera' | 'fog' 
  | 'gameplay' | 'startScreen' | 'arena' | 'bulletTime' 
  | 'tuning' | 'arenaRoom' | 'wraith' | 'wraithArena' | 'crt'
  | 'arenaLogo' | 'battleArea' | 'gameOverArcade' | 'floorSkin' | 'lighting' | 'props'
  | 'json';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const debugParams = useGameStore((state) => state.debugParams);
  const setDebugParams = useGameStore((state) => state.setDebugParams);
  const gameState = useGameStore((state) => state.gameState);
  
  const [activeTab, setActiveTab] = useState<TabType>('physics');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Scene-based tab filtering logic
  const isStartScreen = gameState === 'START_SCREEN';
  
  const getAvailableTabs = (): TabType[] => {
    if (isStartScreen) {
      return ['startScreen', 'wraith', 'visual', 'bulletTime', 'json'];
    }
    return [
      'physics', 'visual', 'camera', 'fog', 'gameplay', 'arena', 'crt',
      'bulletTime', 'tuning', 'arenaRoom', 'wraithArena', 
      'arenaLogo', 'battleArea', 'gameOverArcade', 'floorSkin', 'lighting', 'props', 'json'
    ];
  };

  const availableTabs = getAvailableTabs();

  // Reset section when tab changes
  useEffect(() => {
    setActiveSection(null);
  }, [activeTab]);

  // Auto-switch tab if current one becomes hidden
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(isStartScreen ? 'startScreen' : 'physics');
    }
  }, [gameState, availableTabs]);

  // Broadcast debug panel state to prevent game input
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('debugPanelStateChanged', {
      detail: { isOpen }
    }));
  }, [isOpen]);

  const updateParam = (key: keyof DebugParams, value: number | boolean | string) => {
    setDebugParams({ [key]: value });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('debugParams');
    setDebugParams(DEFAULT_DEBUG_PARAMS);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const renderSection = (id: string, label: string, children: React.ReactNode) => {
    const isExpanded = activeSection === id;
    return (
      <div className={`debug-section-container ${isExpanded ? 'expanded' : ''}`}>
        <div 
          className="section-accordion-header" 
          onClick={() => setActiveSection(isExpanded ? null : id)}
        >
          <span className="accordion-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="section-label">{label.toUpperCase()}</span>
        </div>
        {isExpanded && <div className="section-accordion-content">{children}</div>}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button className="debug-panel-toggle" onClick={handleOpen}>
        ⚙️ DEBUG
      </button>
    );
  };

  return (
    <div 
      className="debug-panel"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="debug-panel-main">
        <div className="debug-panel-header">
          <div className="debug-header-title">
            <span className={`scene-badge ${isStartScreen ? 'start' : 'arena'}`}>
              {isStartScreen ? 'START SCREEN' : 'ARENA MODE'}
            </span>
            <h2>TERMINAL DIAGNOSTICS v2.0</h2>
          </div>
          <div className="header-actions">
            <button className="reset-btn" onClick={resetToDefaults} title="Reset Defaults">🔄</button>
            <button className="close-btn" onClick={handleClose}>✕</button>
          </div>
        </div>

        <div className="debug-panel-content">
          {availableTabs.map((tab) => (
            <div key={tab} className="hud-tab-group">
              <div 
                className={`tab-header ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </div>
              
              {activeTab === tab && (
                <div className="tab-content">
                  {tab === 'physics' && (
                    <>
                      {renderSection('phys_pog', 'Pog Physics', (
                        <div className="debug-section">
                          <EnhancedSlider label="Mass" value={debugParams.pogMass} min={0.1} max={100} step={0.1} onChange={(v) => updateParam('pogMass', v)} decimals={2} />
                          <EnhancedSlider label="Restitution" value={debugParams.pogRestitution} min={0} max={2} step={0.01} onChange={(v) => updateParam('pogRestitution', v)} decimals={2} />
                          <EnhancedSlider label="Friction" value={debugParams.pogFriction} min={0} max={5} step={0.1} onChange={(v) => updateParam('pogFriction', v)} decimals={1} />
                          <EnhancedSlider label="Linear Damp" value={debugParams.pogLinearDamping} min={0} max={5} step={0.01} onChange={(v) => updateParam('pogLinearDamping', v)} decimals={2} />
                          <EnhancedSlider label="Angular Damp" value={debugParams.pogAngularDamping} min={0} max={5} step={0.01} onChange={(v) => updateParam('pogAngularDamping', v)} decimals={2} />
                          <EnhancedSlider label="Max Velocity" value={debugParams.pogMaxVelocity} min={1} max={300} step={1} onChange={(v) => updateParam('pogMaxVelocity', v)} decimals={0} />
                        </div>
                      ))}
                      {renderSection('phys_slam', 'Slammer Physics', (
                        <div className="debug-section">
                          <EnhancedSlider label="Mass" value={debugParams.slammerMass} min={0.1} max={50} step={0.1} onChange={(v) => updateParam('slammerMass', v)} decimals={1} />
                          <EnhancedSlider label="Restitution" value={debugParams.slammerRestitution} min={0} max={2} step={0.01} onChange={(v) => updateParam('slammerRestitution', v)} decimals={2} />
                          <EnhancedSlider label="Friction" value={debugParams.slammerFriction} min={0} max={2} step={0.01} onChange={(v) => updateParam('slammerFriction', v)} decimals={2} />
                          <EnhancedSlider label="Base Force" value={debugParams.slamBaseForce} min={-100} max={100} step={1} onChange={(v) => updateParam('slamBaseForce', v)} decimals={0} />
                          <EnhancedSlider label="Power Mult" value={debugParams.slamPowerMultiplier} min={-5} max={5} step={0.05} onChange={(v) => updateParam('slamPowerMultiplier', v)} decimals={2} />
                          <EnhancedSlider label="Force Mult" value={debugParams.slamForceMultiplier} min={0} max={5} step={0.05} onChange={(v) => updateParam('slamForceMultiplier', v)} decimals={2} />
                        </div>
                      ))}
                      {renderSection('phys_shatter', 'Shatter Suite', (
                        <div className="debug-section">
                          <EnhancedSlider label="Radius" value={debugParams.shatterRadius} min={0} max={5} step={0.05} onChange={(v) => updateParam('shatterRadius', v)} decimals={2} />
                          <EnhancedSlider label="Force Min" value={debugParams.shatterForceMin} min={0} max={50} step={0.5} onChange={(v) => updateParam('shatterForceMin', v)} decimals={1} />
                          <EnhancedSlider label="Force Max" value={debugParams.shatterForceMax} min={0} max={50} step={0.5} onChange={(v) => updateParam('shatterForceMax', v)} decimals={1} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'visual' && (
                    <>
                      {renderSection('vis_slam', 'Slammer Visuals', (
                        <div className="debug-section">
                          <EnhancedSlider label="Opacity" value={debugParams.slammerOpacity} min={0} max={1} step={0.01} onChange={(v) => updateParam('slammerOpacity', v)} decimals={2} />
                          <EnhancedSlider label="Scale Boost" value={debugParams.slammerScaleBoost} min={0} max={1} step={0.01} onChange={(v) => updateParam('slammerScaleBoost', v)} decimals={2} />
                          <EnhancedSlider label="Emissive" value={debugParams.slammerEmissiveIntensity} min={0} max={10} step={0.1} onChange={(v) => updateParam('slammerEmissiveIntensity', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('vis_pog', 'Pog Visuals', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scale" value={debugParams.pogScale} min={0.1} max={5} step={0.1} onChange={(v) => updateParam('pogScale', v)} decimals={1} />
                          <EnhancedSlider label="Rot Speed" value={debugParams.pogRotationSpeed} min={0} max={0.1} step={0.001} onChange={(v) => updateParam('pogRotationSpeed', v)} decimals={3} />
                          <EnhancedSlider label="Metalness" value={debugParams.pogMetalness} min={0} max={1} step={0.01} onChange={(v) => updateParam('pogMetalness', v)} decimals={2} />
                          <EnhancedSlider label="Roughness" value={debugParams.pogRoughness} min={0} max={1} step={0.01} onChange={(v) => updateParam('pogRoughness', v)} decimals={2} />
                        </div>
                      ))}
                      {renderSection('vis_bloom', 'Post Processing', (
                        <div className="debug-section">
                          <EnhancedSlider label="Bloom" value={debugParams.bloomStrength} min={0} max={5} step={0.05} onChange={(v) => updateParam('bloomStrength', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'camera' && (
                    <>
                      {renderSection('cam_base', 'Field of View', (
                        <div className="debug-section">
                          <EnhancedSlider label="Base FOV" value={debugParams.baseFOV} min={10} max={150} step={1} onChange={(v) => updateParam('baseFOV', v)} decimals={0} unit="°" />
                          <EnhancedSlider label="Punch FOV" value={debugParams.punchFOV} min={10} max={170} step={1} onChange={(v) => updateParam('punchFOV', v)} decimals={0} unit="°" />
                          <EnhancedSlider label="Lerp Speed" value={debugParams.fovLerpSpeed} min={0.01} max={1} step={0.01} onChange={(v) => updateParam('fovLerpSpeed', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'fog' && (
                    <>
                      {renderSection('fog_vars', 'Atmosphere', (
                        <div className="debug-section">
                          <EnhancedSlider label="Density" value={debugParams.fogDensity} min={0} max={0.2} step={0.001} onChange={(v) => updateParam('fogDensity', v)} decimals={3} />
                          <EnhancedSlider label="Near" value={debugParams.fogNear} min={0} max={50} step={0.5} onChange={(v) => updateParam('fogNear', v)} decimals={1} />
                          <EnhancedSlider label="Far" value={debugParams.fogFar} min={1} max={500} step={1} onChange={(v) => updateParam('fogFar', v)} decimals={0} />
                          <EnhancedSlider label="Color R" value={debugParams.fogColorR} min={0} max={1} step={0.01} onChange={(v) => updateParam('fogColorR', v)} decimals={2} />
                          <EnhancedSlider label="Color G" value={debugParams.fogColorG} min={0} max={1} step={0.01} onChange={(v) => updateParam('fogColorG', v)} decimals={2} />
                          <EnhancedSlider label="Color B" value={debugParams.fogColorB} min={0} max={1} step={0.01} onChange={(v) => updateParam('fogColorB', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'crt' && (
                    <>
                      {renderSection('crt_tube', 'Tube Decay', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scanline Int" value={debugParams.crtScanlineIntensity} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtScanlineIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Scanline H" value={debugParams.crtScanlineHeight} min={1} max={10} step={1} onChange={(v) => updateParam('crtScanlineHeight', v)} decimals={0} />
                          <EnhancedSlider label="Vignette" value={debugParams.crtVignetteIntensity} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtVignetteIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Flicker" value={debugParams.crtFlickerIntensity} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtFlickerIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Phosphor" value={debugParams.crtPhosphorBurn} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtPhosphorBurn', v)} decimals={2} />
                          <EnhancedSlider label="Jitter" value={debugParams.crtJitterIntensity} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtJitterIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Warmth" value={debugParams.crtWarmth} min={0} max={1} step={0.01} onChange={(v) => updateParam('crtWarmth', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'gameplay' && (
                    <>
                      {renderSection('game_timing', 'Action Timing', (
                        <div className="debug-section">
                          <EnhancedSlider label="Charge Spd" value={debugParams.powerChargeSpeed} min={10} max={1000} step={10} onChange={(v) => updateParam('powerChargeSpeed', v)} decimals={0} />
                          <EnhancedSlider label="Slam Delay" value={debugParams.slamDelay} min={0} max={2000} step={50} onChange={(v) => updateParam('slamDelay', v)} decimals={0} unit="ms" />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'startScreen' && (
                    <>
                      {renderSection('ss_logo', 'Logo 3D', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scale" value={debugParams.logoScale} min={0.1} max={50} step={0.1} onChange={(v) => updateParam('logoScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos X" value={debugParams.logoPositionX} min={-50} max={50} step={0.1} onChange={(v) => updateParam('logoPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.logoPositionY} min={-50} max={50} step={0.1} onChange={(v) => updateParam('logoPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.logoPositionZ} min={-100} max={50} step={0.5} onChange={(v) => updateParam('logoPositionZ', v)} decimals={1} />
                          <EnhancedSlider label="Rot Y" value={debugParams.logoRotationY} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => updateParam('logoRotationY', v)} decimals={2} />
                        </div>
                      ))}
                      {renderSection('ss_fog', 'Atmosphere', (
                        <div className="debug-section">
                          <EnhancedSlider label="Density" value={debugParams.startFogDensity} min={0} max={0.1} step={0.0005} onChange={(v) => updateParam('startFogDensity', v)} decimals={4} />
                          <EnhancedSlider label="Color R" value={debugParams.startFogColorR} min={0} max={1} step={0.01} onChange={(v) => updateParam('startFogColorR', v)} decimals={2} />
                          <EnhancedSlider label="Color G" value={debugParams.startFogColorG} min={0} max={1} step={0.01} onChange={(v) => updateParam('startFogColorG', v)} decimals={2} />
                          <EnhancedSlider label="Color B" value={debugParams.startFogColorB} min={0} max={1} step={0.01} onChange={(v) => updateParam('startFogColorB', v)} decimals={2} />
                        </div>
                      ))}
                      {renderSection('ss_smoke_g', 'Neon Smoke (Ground)', (
                        <div className="debug-section">
                          <EnhancedSlider label="Color R" value={debugParams.smokeGroundColorR} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeGroundColorR', v)} decimals={2} />
                          <EnhancedSlider label="Color G" value={debugParams.smokeGroundColorG} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeGroundColorG', v)} decimals={2} />
                          <EnhancedSlider label="Color B" value={debugParams.smokeGroundColorB} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeGroundColorB', v)} decimals={2} />
                          <EnhancedSlider label="Opacity" value={debugParams.smokeGroundOpacity} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeGroundOpacity', v)} decimals={2} />
                          <EnhancedSlider label="Speed" value={debugParams.smokeGroundSpeed} min={0} max={10} step={0.1} onChange={(v) => updateParam('smokeGroundSpeed', v)} decimals={1} />
                          <EnhancedSlider label="Count" value={debugParams.smokeGroundCount} min={1} max={300} step={1} onChange={(v) => updateParam('smokeGroundCount', v)} decimals={0} />
                          <EnhancedSlider label="Size" value={debugParams.smokeGroundSize} min={1} max={500} step={1} onChange={(v) => updateParam('smokeGroundSize', v)} decimals={0} />
                          <EnhancedSlider label="Spread" value={debugParams.smokeGroundSpread} min={1} max={1000} step={5} onChange={(v) => updateParam('smokeGroundSpread', v)} decimals={0} />
                          <EnhancedSlider label="Height" value={debugParams.smokeGroundHeight} min={-50} max={50} step={0.5} onChange={(v) => updateParam('smokeGroundHeight', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('ss_smoke_m', 'Neon Smoke (Mid)', (
                        <div className="debug-section">
                          <EnhancedSlider label="Color R" value={debugParams.smokeMidColorR} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeMidColorR', v)} decimals={2} />
                          <EnhancedSlider label="Color G" value={debugParams.smokeMidColorG} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeMidColorG', v)} decimals={2} />
                          <EnhancedSlider label="Color B" value={debugParams.smokeMidColorB} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeMidColorB', v)} decimals={2} />
                          <EnhancedSlider label="Opacity" value={debugParams.smokeMidOpacity} min={0} max={1} step={0.01} onChange={(v) => updateParam('smokeMidOpacity', v)} decimals={2} />
                          <EnhancedSlider label="Speed" value={debugParams.smokeMidSpeed} min={0} max={5} step={0.05} onChange={(v) => updateParam('smokeMidSpeed', v)} decimals={2} />
                          <EnhancedSlider label="Count" value={debugParams.smokeMidCount} min={1} max={100} step={1} onChange={(v) => updateParam('smokeMidCount', v)} decimals={0} />
                          <EnhancedSlider label="Size" value={debugParams.smokeMidSize} min={1} max={200} step={1} onChange={(v) => updateParam('smokeMidSize', v)} decimals={0} />
                        </div>
                      ))}
                      {renderSection('ss_store', 'Arcade Storefront', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scale" value={debugParams.storefrontScale} min={0.1} max={50} step={0.1} onChange={(v) => updateParam('storefrontScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.storefrontPositionY} min={-50} max={50} step={0.5} onChange={(v) => updateParam('storefrontPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.storefrontPositionZ} min={-500} max={0} step={1} onChange={(v) => updateParam('storefrontPositionZ', v)} decimals={0} />
                          <EnhancedSlider label="Rot Y" value={debugParams.storefrontRotationY} min={-Math.PI * 2} max={Math.PI * 2} step={0.01} onChange={(v) => updateParam('storefrontRotationY', v)} decimals={2} />
                        </div>
                      ))}
                      {renderSection('ss_btn', 'Start Button', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scale" value={debugParams.buttonScale} min={0.1} max={5} step={0.1} onChange={(v) => updateParam('buttonScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.buttonPositionY} min={0} max={100} step={1} onChange={(v) => updateParam('buttonPositionY', v)} decimals={0} unit="%" />
                          <EnhancedSlider label="Font Size" value={debugParams.buttonFontSize} min={10} max={100} step={1} onChange={(v) => updateParam('buttonFontSize', v)} decimals={0} unit="px" />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'arena' && (
                    <>
                      {renderSection('arena_core', 'Arena Core', (
                        <div className="debug-section">
                          <EnhancedSlider label="Light Int" value={debugParams.arenaLightIntensity} min={0} max={5} step={0.1} onChange={(v) => updateParam('arenaLightIntensity', v)} decimals={1} />
                          <EnhancedSlider label="Amb Int" value={debugParams.arenaAmbientIntensity} min={0} max={2} step={0.05} onChange={(v) => updateParam('arenaAmbientIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Floor Y" value={debugParams.floorPositionY} min={-10} max={10} step={0.1} onChange={(v) => updateParam('floorPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Ground Offset" value={debugParams.groundPhysicalOffset} min={-5} max={5} step={0.005} onChange={(v) => updateParam('groundPhysicalOffset', v)} decimals={3} />
                          <BooleanToggle label="Show Collider" value={debugParams.showGroundCollider} onChange={(v) => updateParam('showGroundCollider', v)} />
                          <BooleanToggle label="Floor Visible" value={debugParams.floorVisible} onChange={(v) => updateParam('floorVisible', v)} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'tuning' && (
                    <>
                      {renderSection('tune_eruption', 'Eruption Core', (
                        <div className="debug-section">
                          <EnhancedSlider label="Upward Kick" value={debugParams.eruptionUpwardMultiplier} min={0} max={5} step={0.1} onChange={(v) => updateParam('eruptionUpwardMultiplier', v)} decimals={1} />
                          <EnhancedSlider label="Radius" value={debugParams.eruptionRadius} min={0.1} max={10} step={0.1} onChange={(v) => updateParam('eruptionRadius', v)} decimals={1} />
                          <EnhancedSlider label="Torque Mult" value={debugParams.eruptionTorqueMultiplier} min={0} max={2} step={0.05} onChange={(v) => updateParam('eruptionTorqueMultiplier', v)} decimals={2} />
                          <EnhancedSlider label="Auto Power" value={debugParams.autoSlamPower} min={0} max={100} step={1} onChange={(v) => updateParam('autoSlamPower', v)} decimals={0} />
                        </div>
                      ))}
                      {renderSection('tune_scatter', 'Scatter Physics', (
                        <div className="debug-section">
                          <EnhancedSlider label="Explosion" value={debugParams.cinematicExplosionForce} min={0} max={50} step={0.5} onChange={(v) => updateParam('cinematicExplosionForce', v)} decimals={1} />
                          <EnhancedSlider label="Radius" value={debugParams.cinematicScatterRadius} min={0.1} max={20} step={0.1} onChange={(v) => updateParam('cinematicScatterRadius', v)} decimals={1} />
                          <EnhancedSlider label="Height" value={debugParams.cinematicScatterHeight} min={0.1} max={15} step={0.1} onChange={(v) => updateParam('cinematicScatterHeight', v)} decimals={1} />
                          <EnhancedSlider label="Rot Speed" value={debugParams.cinematicPogRotationSpeed} min={0} max={20} step={0.5} onChange={(v) => updateParam('cinematicPogRotationSpeed', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('tune_timing', 'Scene Physics', (
                        <div className="debug-section">
                          <EnhancedSlider label="Transition" value={debugParams.cinematicTransitionSpeed} min={0.1} max={10} step={0.1} onChange={(v) => updateParam('cinematicTransitionSpeed', v)} decimals={1} />
                          <EnhancedSlider label="Flash Int" value={debugParams.cinematicImpactFlashIntensity} min={0} max={10} step={0.1} onChange={(v) => updateParam('cinematicImpactFlashIntensity', v)} decimals={1} />
                          <EnhancedSlider label="Blur Str" value={debugParams.cinematicMotionBlurStrength} min={0} max={1} step={0.05} onChange={(v) => updateParam('cinematicMotionBlurStrength', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'bulletTime' && (
                    <>
                      {renderSection('bt_main', 'Cinematic Timeline', (
                        <div className="debug-section">
                          <EnhancedSlider label="Windup" value={debugParams.cinematicWindupDuration} min={0.1} max={10} step={0.1} onChange={(v) => updateParam('cinematicWindupDuration', v)} decimals={1} unit="s" />
                          <EnhancedSlider label="Freeze" value={debugParams.cinematicFreezeDuration} min={0} max={5} step={0.05} onChange={(v) => updateParam('cinematicFreezeDuration', v)} decimals={2} unit="s" />
                          <EnhancedSlider label="Orbit" value={debugParams.cinematicOrbitDuration} min={0.5} max={15} step={0.5} onChange={(v) => updateParam('cinematicOrbitDuration', v)} decimals={1} unit="s" />
                          <EnhancedSlider label="Reveal" value={debugParams.cinematicRevealDuration} min={0.1} max={10} step={0.1} onChange={(v) => updateParam('cinematicRevealDuration', v)} decimals={1} unit="s" />
                        </div>
                      ))}
                      {renderSection('bt_cam', 'Camera & Zoom', (
                        <div className="debug-section">
                          <EnhancedSlider label="Orbit Radius" value={debugParams.cinematicOrbitRadius} min={1} max={30} step={0.5} onChange={(v) => updateParam('cinematicOrbitRadius', v)} decimals={1} />
                          <EnhancedSlider label="Orbit Height" value={debugParams.cinematicOrbitHeight} min={0} max={10} step={0.1} onChange={(v) => updateParam('cinematicOrbitHeight', v)} decimals={1} />
                          <EnhancedSlider label="Zoom Mult" value={debugParams.cinematicDynamicZoomMultiplier} min={1} max={10} step={0.1} onChange={(v) => updateParam('cinematicDynamicZoomMultiplier', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('bt_comet', 'Comet approach', (
                        <div className="debug-section">
                          <EnhancedSlider label="Approach Spd" value={debugParams.cinematicCometApproachSpeed} min={1} max={200} step={1} onChange={(v) => updateParam('cinematicCometApproachSpeed', v)} decimals={0} />
                          <EnhancedSlider label="Start Dist" value={debugParams.cinematicCometStartDistance} min={5} max={100} step={1} onChange={(v) => updateParam('cinematicCometStartDistance', v)} decimals={0} />
                          <EnhancedSlider label="FOV Punch" value={debugParams.cinematicCometFOVPunch} min={10} max={170} step={5} onChange={(v) => updateParam('cinematicCometFOVPunch', v)} decimals={0} />
                        </div>
                      ))}
                      {renderSection('bt_lockon', 'Lock-On Meta', (
                        <div className="debug-section">
                          <BooleanToggle label="Enable Lock-On" value={debugParams.cinematicLockOnEnabled} onChange={(v) => updateParam('cinematicLockOnEnabled', v)} />
                          <EnhancedSlider label="Lock On Dur" value={debugParams.cinematicLockOnDuration} min={0.5} max={10} step={0.1} onChange={(v) => updateParam('cinematicLockOnDuration', v)} decimals={1} unit="s" />
                          <EnhancedSlider label="Lock Orbit" value={debugParams.cinematicLockOnOrbitRadius} min={1} max={15} step={0.1} onChange={(v) => updateParam('cinematicLockOnOrbitRadius', v)} decimals={1} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'arenaRoom' && (
                    <>
                      {renderSection('ar_room', 'Room GLB', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.arenaRoomVisible} onChange={(v) => updateParam('arenaRoomVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.arenaRoomScale} min={0.001} max={2} step={0.001} onChange={(v) => updateParam('arenaRoomScale', v)} decimals={3} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaRoomPositionX} min={-100} max={100} step={0.5} onChange={(v) => updateParam('arenaRoomPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaRoomPositionY} min={-100} max={100} step={0.5} onChange={(v) => updateParam('arenaRoomPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.arenaRoomPositionZ} min={-200} max={100} step={1} onChange={(v) => updateParam('arenaRoomPositionZ', v)} decimals={0} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'wraith' && (
                    <>
                      {renderSection('wr_start', 'Wraith (Start Screen)', (
                        <div className="debug-section">
                          <EnhancedSlider label="Scale" value={debugParams.wraithScale} min={0.1} max={50} step={0.1} onChange={(v) => updateParam('wraithScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos X" value={debugParams.wraithPositionX} min={-50} max={50} step={0.1} onChange={(v) => updateParam('wraithPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.wraithPositionY} min={-50} max={50} step={0.1} onChange={(v) => updateParam('wraithPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.wraithPositionZ} min={-100} max={50} step={0.5} onChange={(v) => updateParam('wraithPositionZ', v)} decimals={1} />
                          <EnhancedSlider label="Rot Y" value={debugParams.wraithRotationY} min={-Math.PI * 2} max={Math.PI * 2} step={0.01} onChange={(v) => updateParam('wraithRotationY', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'wraithArena' && (
                    <>
                      {renderSection('wa_wraith', 'Wraith (Arena)', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.wraithArenaVisible} onChange={(v) => updateParam('wraithArenaVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.wraithArenaScale} min={0.1} max={50} step={0.1} onChange={(v) => updateParam('wraithArenaScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos X" value={debugParams.wraithArenaPositionX} min={-100} max={100} step={0.5} onChange={(v) => updateParam('wraithArenaPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.wraithArenaPositionY} min={-50} max={50} step={0.25} onChange={(v) => updateParam('wraithArenaPositionY', v)} decimals={2} />
                          <EnhancedSlider label="Pos Z" value={debugParams.wraithArenaPositionZ} min={-100} max={100} step={0.5} onChange={(v) => updateParam('wraithArenaPositionZ', v)} decimals={1} />
                          <EnhancedSlider label="Rot Y" value={debugParams.wraithArenaRotationY} min={-Math.PI * 2} max={Math.PI * 2} step={0.01} onChange={(v) => updateParam('wraithArenaRotationY', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'arenaLogo' && (
                    <>
                      {renderSection('al_logo', 'Arena Logo GLB', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.arenaLogoVisible} onChange={(v) => updateParam('arenaLogoVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.arenaLogoScale} min={0.1} max={100} step={0.1} onChange={(v) => updateParam('arenaLogoScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaLogoPositionX} min={-100} max={100} step={0.5} onChange={(v) => updateParam('arenaLogoPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaLogoPositionY} min={-100} max={100} step={0.5} onChange={(v) => updateParam('arenaLogoPositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.arenaLogoPositionZ} min={-100} max={100} step={0.5} onChange={(v) => updateParam('arenaLogoPositionZ', v)} decimals={1} />
                          <EnhancedSlider label="Rot Y" value={debugParams.arenaLogoRotationY} min={-Math.PI * 2} max={Math.PI * 2} step={0.01} onChange={(v) => updateParam('arenaLogoRotationY', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'battleArea' && (
                    <>
                      {renderSection('ba_mat', 'Battle Mat', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.battleAreaVisible} onChange={(v) => updateParam('battleAreaVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.battleAreaScale} min={0.1} max={20} step={0.1} onChange={(v) => updateParam('battleAreaScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.battleAreaPositionY} min={-5} max={5} step={0.01} onChange={(v) => updateParam('battleAreaPositionY', v)} decimals={2} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'gameOverArcade' && (
                    <>
                      {renderSection('go_arcade', 'Game Over GLB', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.gameOverArcadeVisible} onChange={(v) => updateParam('gameOverArcadeVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.gameOverArcadeScale} min={1} max={200} step={1} onChange={(v) => updateParam('gameOverArcadeScale', v)} decimals={0} />
                          <EnhancedSlider label="Pos X" value={debugParams.gameOverArcadePositionX} min={-100} max={100} step={0.5} onChange={(v) => updateParam('gameOverArcadePositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.gameOverArcadePositionY} min={-100} max={100} step={0.5} onChange={(v) => updateParam('gameOverArcadePositionY', v)} decimals={1} />
                          <EnhancedSlider label="Pos Z" value={debugParams.gameOverArcadePositionZ} min={-100} max={100} step={0.5} onChange={(v) => updateParam('gameOverArcadePositionZ', v)} decimals={1} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'floorSkin' && (
                    <>
                      {renderSection('fs_skin', 'Floor Skin GLB', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.arenaFloorSkinVisible} onChange={(v) => updateParam('arenaFloorSkinVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.arenaFloorSkinScale} min={1} max={300} step={1} onChange={(v) => updateParam('arenaFloorSkinScale', v)} decimals={0} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaFloorSkinPositionX} min={-200} max={200} step={0.5} onChange={(v) => updateParam('arenaFloorSkinPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaFloorSkinPositionY} min={-20} max={20} step={0.01} onChange={(v) => updateParam('arenaFloorSkinPositionY', v)} decimals={2} />
                          <EnhancedSlider label="Pos Z" value={debugParams.arenaFloorSkinPositionZ} min={-200} max={200} step={1} onChange={(v) => updateParam('arenaFloorSkinPositionZ', v)} decimals={0} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'lighting' && (
                    <>
                      {renderSection('li_helpers', 'Utilities', (
                        <div className="debug-section">
                          <BooleanToggle label="Show Helpers" value={debugParams.arenaShowLightHelpers} onChange={(v) => updateParam('arenaShowLightHelpers', v)} />
                        </div>
                      ))}
                      {renderSection('li_dir', 'Directional Light', (
                        <div className="debug-section">
                          <EnhancedSlider label="Intensity" value={debugParams.arenaDirLightIntensity} min={0} max={2} step={0.01} onChange={(v) => updateParam('arenaDirLightIntensity', v)} decimals={2} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaDirLightPositionX} min={-100} max={100} step={1} onChange={(v) => updateParam('arenaDirLightPositionX', v)} decimals={0} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaDirLightPositionY} min={0} max={200} step={1} onChange={(v) => updateParam('arenaDirLightPositionY', v)} decimals={0} />
                          <EnhancedSlider label="Pos Z" value={debugParams.arenaDirLightPositionZ} min={-100} max={100} step={1} onChange={(v) => updateParam('arenaDirLightPositionZ', v)} decimals={0} />
                        </div>
                      ))}
                      {renderSection('li_spot', 'Spot Light', (
                        <div className="debug-section">
                          <EnhancedSlider label="Intensity" value={debugParams.arenaSpotLightIntensity} min={0} max={100} step={1} onChange={(v) => updateParam('arenaSpotLightIntensity', v)} decimals={0} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaSpotLightPositionX} min={-50} max={50} step={0.5} onChange={(v) => updateParam('arenaSpotLightPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaSpotLightPositionY} min={0} max={50} step={0.5} onChange={(v) => updateParam('arenaSpotLightPositionY', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('li_point1', 'Point Light 1', (
                        <div className="debug-section">
                          <EnhancedSlider label="Intensity" value={debugParams.arenaPointLightIntensity} min={0} max={1000} step={10} onChange={(v) => updateParam('arenaPointLightIntensity', v)} decimals={0} />
                          <EnhancedSlider label="Pos X" value={debugParams.arenaPointLightPositionX} min={-30} max={30} step={0.2} onChange={(v) => updateParam('arenaPointLightPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arenaPointLightPositionY} min={0} max={40} step={0.2} onChange={(v) => updateParam('arenaPointLightPositionY', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('li_point2', 'Point Light 2', (
                        <div className="debug-section">
                          <EnhancedSlider label="Intensity" value={debugParams.arenaPoint2LightIntensity} min={0} max={1000} step={10} onChange={(v) => updateParam('arenaPoint2LightIntensity', v)} decimals={0} />
                          <EnhancedSlider label="Pos Z" value={debugParams.arenaPoint2LightPositionZ} min={-50} max={50} step={1} onChange={(v) => updateParam('arenaPoint2LightPositionZ', v)} decimals={0} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'props' && (
                    <>
                      {renderSection('pr_cab', 'Arcade Cabinet', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.arcadeCabinetVisible} onChange={(v) => updateParam('arcadeCabinetVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.arcadeCabinetScale} min={0.01} max={1} step={0.01} onChange={(v) => updateParam('arcadeCabinetScale', v)} decimals={2} />
                          <EnhancedSlider label="Pos X" value={debugParams.arcadeCabinetPositionX} min={-50} max={50} step={0.5} onChange={(v) => updateParam('arcadeCabinetPositionX', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.arcadeCabinetPositionY} min={-20} max={20} step={0.1} onChange={(v) => updateParam('arcadeCabinetPositionY', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('pr_back', 'Arcade Back', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.arcadeBackVisible} onChange={(v) => updateParam('arcadeBackVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.arcadeBackScale} min={0.01} max={1} step={0.01} onChange={(v) => updateParam('arcadeBackScale', v)} decimals={2} />
                          <EnhancedSlider label="Pos X" value={debugParams.arcadeBackPositionX} min={-50} max={50} step={0.5} onChange={(v) => updateParam('arcadeBackPositionX', v)} decimals={1} />
                        </div>
                      ))}
                      {renderSection('pr_landmark', 'Pro Tour Landmark', (
                        <div className="debug-section">
                          <BooleanToggle label="Visible" value={debugParams.proTourVisible} onChange={(v) => updateParam('proTourVisible', v)} />
                          <EnhancedSlider label="Scale" value={debugParams.proTourScale} min={0.1} max={30} step={0.1} onChange={(v) => updateParam('proTourScale', v)} decimals={1} />
                          <EnhancedSlider label="Pos Y" value={debugParams.proTourPositionY} min={-20} max={20} step={0.1} onChange={(v) => updateParam('proTourPositionY', v)} decimals={1} />
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'json' && (
                    <div className="debug-tab-content">
                      <p style={{ fontSize: '10px', opacity: 0.7, marginBottom: '10px' }}>LIVE CONFIG EXPORT</p>
                      <textarea
                        readOnly
                        value={JSON.stringify(debugParams, null, 2)}
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        className="hud-json-exporter"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
