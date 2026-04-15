import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { DebugParams } from '../../store/useGameStore';
import { DEFAULT_DEBUG_PARAMS } from '../../store/useGameStore';
import './DebugPanel.css';

type TabType = 'physics' | 'visual' | 'camera' | 'fog' | 'gameplay' | 'startScreen' | 'arena' | 'bulletTime';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const debugParams = useGameStore((state) => state.debugParams);
  const setDebugParams = useGameStore((state) => state.setDebugParams);
  const [activeTab, setActiveTab] = useState<TabType>('physics');

  // Broadcast debug panel state to prevent game input
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('debugPanelStateChanged', {
      detail: { isOpen }
    }));
  }, [isOpen]);

  const updateParam = (key: keyof DebugParams, value: number) => {
    setDebugParams({ [key]: value });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('debugParams');
    setDebugParams(DEFAULT_DEBUG_PARAMS);
  };

  const exportParams = () => {
    const json = JSON.stringify(debugParams, null, 2);
    navigator.clipboard.writeText(json);
    alert('Parameters copied to clipboard!');
  };

  const importParams = () => {
    const json = prompt('Paste JSON parameters:');
    if (json) {
      try {
        const imported = JSON.parse(json);
        setDebugParams(imported);
      } catch (e) {
        alert('Invalid JSON');
      }
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
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
      <div className="debug-panel-header">
        <h2>🔧 DEBUG CONTROL PANEL</h2>
        <button onClick={handleClose}>✕</button>
      </div>

      <div className="debug-panel-tabs">
        <button 
          className={activeTab === 'physics' ? 'active' : ''} 
          onClick={() => setActiveTab('physics')}
        >
          Physics
        </button>
        <button 
          className={activeTab === 'visual' ? 'active' : ''} 
          onClick={() => setActiveTab('visual')}
        >
          Visual
        </button>
        <button 
          className={activeTab === 'camera' ? 'active' : ''} 
          onClick={() => setActiveTab('camera')}
        >
          Camera
        </button>
        <button 
          className={activeTab === 'fog' ? 'active' : ''} 
          onClick={() => setActiveTab('fog')}
        >
          Fog
        </button>
        <button 
          className={activeTab === 'gameplay' ? 'active' : ''} 
          onClick={() => setActiveTab('gameplay')}
        >
          Gameplay
        </button>
        <button 
          className={activeTab === 'startScreen' ? 'active' : ''} 
          onClick={() => setActiveTab('startScreen')}
        >
          Start Screen
        </button>
        <button 
          className={activeTab === 'arena' ? 'active' : ''} 
          onClick={() => setActiveTab('arena')}
        >
          Arena
        </button>
          <button className={activeTab === 'bulletTime' ? 'active' : ''} onClick={() => setActiveTab('bulletTime')}>
            BULLET TIME
          </button>
      </div>

      <div className="debug-panel-content">
        {activeTab === 'physics' && (
          <>
            <div className="debug-section">
              <h3>POG PHYSICS</h3>
              
              <div className="debug-control">
                <label>Mass: <span>{debugParams.pogMass.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.1" max="120" 
                  step="0.1" 
                  value={debugParams.pogMass}
                  onChange={(e) => updateParam('pogMass', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Restitution (Bounce): <span>{debugParams.pogRestitution.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.pogRestitution}
                  onChange={(e) => updateParam('pogRestitution', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Friction: <span>{debugParams.pogFriction.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.pogFriction}
                  onChange={(e) => updateParam('pogFriction', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Linear Damping: <span>{debugParams.pogLinearDamping.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.pogLinearDamping}
                  onChange={(e) => updateParam('pogLinearDamping', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Angular Damping: <span>{debugParams.pogAngularDamping.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.pogAngularDamping}
                  onChange={(e) => updateParam('pogAngularDamping', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>SLAMMER PHYSICS</h3>
              
              <div className="debug-control">
                <label>Mass: <span>{debugParams.slammerMass.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.1" 
                  value={debugParams.slammerMass}
                  onChange={(e) => updateParam('slammerMass', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Restitution: <span>{debugParams.slammerRestitution.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.slammerRestitution}
                  onChange={(e) => updateParam('slammerRestitution', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Friction: <span>{debugParams.slammerFriction.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.slammerFriction}
                  onChange={(e) => updateParam('slammerFriction', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Base Slam Force: <span>{debugParams.slamBaseForce.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="-50" 
                  max="0" 
                  step="1" 
                  value={debugParams.slamBaseForce}
                  onChange={(e) => updateParam('slamBaseForce', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Power Multiplier: <span>{debugParams.slamPowerMultiplier.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-1" 
                  max="0" 
                  step="0.05" 
                  value={debugParams.slamPowerMultiplier}
                  onChange={(e) => updateParam('slamPowerMultiplier', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Shatter Radius: <span>{debugParams.shatterRadius.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.1" max="120" 
                  step="0.05" 
                  value={debugParams.shatterRadius}
                  onChange={(e) => updateParam('shatterRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Shatter Force Min: <span>{debugParams.shatterForceMin.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.shatterForceMin}
                  onChange={(e) => updateParam('shatterForceMin', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Shatter Force Max: <span>{debugParams.shatterForceMax.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.1" 
                  value={debugParams.shatterForceMax}
                  onChange={(e) => updateParam('shatterForceMax', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'visual' && (
          <>
            <div className="debug-section">
              <h3>SLAMMER VISUALS</h3>
              
              <div className="debug-control">
                <label>Ghost Opacity: <span>{debugParams.slammerOpacity.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.slammerOpacity}
                  onChange={(e) => updateParam('slammerOpacity', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Power Scale Boost: <span>{debugParams.slammerScaleBoost.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.5" 
                  step="0.05" 
                  value={debugParams.slammerScaleBoost}
                  onChange={(e) => updateParam('slammerScaleBoost', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Emissive Intensity: <span>{debugParams.slammerEmissiveIntensity.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.1" 
                  value={debugParams.slammerEmissiveIntensity}
                  onChange={(e) => updateParam('slammerEmissiveIntensity', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>POG VISUALS</h3>
              
              <div className="debug-control">
                <label>Scale: <span>{debugParams.pogScale.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.pogScale}
                  onChange={(e) => updateParam('pogScale', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation Speed: <span>{debugParams.pogRotationSpeed.toFixed(3)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.02" 
                  step="0.001" 
                  value={debugParams.pogRotationSpeed}
                  onChange={(e) => updateParam('pogRotationSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Metalness: <span>{debugParams.pogMetalness.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.pogMetalness}
                  onChange={(e) => updateParam('pogMetalness', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Roughness: <span>{debugParams.pogRoughness.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.pogRoughness}
                  onChange={(e) => updateParam('pogRoughness', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'camera' && (
          <div className="debug-section">
            <h3>CAMERA SETTINGS</h3>
            
            <div className="debug-control">
              <label>Base FOV: <span>{debugParams.baseFOV.toFixed(0)}°</span></label>
              <input 
                type="range" 
                min="30" 
                max="90" 
                step="1" 
                value={debugParams.baseFOV}
                onChange={(e) => updateParam('baseFOV', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Punch FOV: <span>{debugParams.punchFOV.toFixed(0)}°</span></label>
              <input 
                type="range" 
                min="30" 
                max="120" 
                step="1" 
                value={debugParams.punchFOV}
                onChange={(e) => updateParam('punchFOV', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>FOV Lerp Speed: <span>{debugParams.fovLerpSpeed.toFixed(2)}</span></label>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                value={debugParams.fovLerpSpeed}
                onChange={(e) => updateParam('fovLerpSpeed', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'fog' && (
          <div className="debug-section">
            <h3>FOG SETTINGS</h3>
            
            <div className="debug-control">
              <label>Density: <span>{debugParams.fogDensity.toFixed(3)}</span></label>
              <input 
                type="range" 
                min="0" 
                max="0.1" 
                step="0.001" 
                value={debugParams.fogDensity}
                onChange={(e) => updateParam('fogDensity', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Near: <span>{debugParams.fogNear.toFixed(1)}</span></label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="0.5" 
                value={debugParams.fogNear}
                onChange={(e) => updateParam('fogNear', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Far: <span>{debugParams.fogFar.toFixed(0)}</span></label>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5" 
                value={debugParams.fogFar}
                onChange={(e) => updateParam('fogFar', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'gameplay' && (
          <div className="debug-section">
            <h3>GAMEPLAY TUNING</h3>
            
            <div className="debug-control">
              <label>Power Charge Speed: <span>{debugParams.powerChargeSpeed.toFixed(0)}</span></label>
              <input 
                type="range" 
                min="50" 
                max="500" 
                step="10" 
                value={debugParams.powerChargeSpeed}
                onChange={(e) => updateParam('powerChargeSpeed', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Slam Impact Delay (ms): <span>{debugParams.slamDelay.toFixed(0)}</span></label>
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="50" 
                value={debugParams.slamDelay}
                onChange={(e) => updateParam('slamDelay', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'startScreen' && (
          <>
            <div className="debug-section">
              <h3>LOGO 3D</h3>
              
              <div className="debug-control">
                <label>Scale: <span>{debugParams.logoScale.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.1" max="120" 
                  step="0.1" 
                  value={debugParams.logoScale}
                  onChange={(e) => updateParam('logoScale', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position X: <span>{debugParams.logoPositionX.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="0.1" 
                  value={debugParams.logoPositionX}
                  onChange={(e) => updateParam('logoPositionX', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position Y: <span>{debugParams.logoPositionY.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="0.1" 
                  value={debugParams.logoPositionY}
                  onChange={(e) => updateParam('logoPositionY', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position Z: <span>{debugParams.logoPositionZ.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-400" 
                  max="400" 
                  step="0.1" 
                  value={debugParams.logoPositionZ}
                  onChange={(e) => updateParam('logoPositionZ', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation X: <span>{debugParams.logoRotationX.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.logoRotationX}
                  onChange={(e) => updateParam('logoRotationX', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation Y: <span>{debugParams.logoRotationY.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.logoRotationY}
                  onChange={(e) => updateParam('logoRotationY', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation Z: <span>{debugParams.logoRotationZ.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.logoRotationZ}
                  onChange={(e) => updateParam('logoRotationZ', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>BACKGROUND 3D</h3>
              
              <div className="debug-control">
                <label>Scale: <span>{debugParams.bgScale.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.01" max="50" 
                  step="0.1" 
                  value={debugParams.bgScale}
                  onChange={(e) => updateParam('bgScale', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position X: <span>{debugParams.bgPositionX.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="0.5" 
                  value={debugParams.bgPositionX}
                  onChange={(e) => updateParam('bgPositionX', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position Y: <span>{debugParams.bgPositionY.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="0.5" 
                  value={debugParams.bgPositionY}
                  onChange={(e) => updateParam('bgPositionY', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position Z: <span>{debugParams.bgPositionZ.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-500" 
                  max="100" 
                  step="0.5" 
                  value={debugParams.bgPositionZ}
                  onChange={(e) => updateParam('bgPositionZ', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation X: <span>{debugParams.bgRotationX.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.bgRotationX}
                  onChange={(e) => updateParam('bgRotationX', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation Y: <span>{debugParams.bgRotationY.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.bgRotationY}
                  onChange={(e) => updateParam('bgRotationY', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rotation Z: <span>{debugParams.bgRotationZ.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="-12.56" 
                  max="12.56" 
                  step="0.1" 
                  value={debugParams.bgRotationZ}
                  onChange={(e) => updateParam('bgRotationZ', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>SCENE FOG</h3>
              
              <div className="debug-control">
                <label>Density: <span>{debugParams.startFogDensity.toFixed(4)}</span></label>
                <input 
                  type="range" 
                  min="0" max="0.1" 
                  step="0.0005" 
                  value={debugParams.startFogDensity}
                  onChange={(e) => updateParam('startFogDensity', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Color R: <span>{debugParams.startFogColorR.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" max="1" 
                  step="0.01" 
                  value={debugParams.startFogColorR}
                  onChange={(e) => updateParam('startFogColorR', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Color G: <span>{debugParams.startFogColorG.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" max="1" 
                  step="0.01" 
                  value={debugParams.startFogColorG}
                  onChange={(e) => updateParam('startFogColorG', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Color B: <span>{debugParams.startFogColorB.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" max="1" 
                  step="0.01" 
                  value={debugParams.startFogColorB}
                  onChange={(e) => updateParam('startFogColorB', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>GROUND FOG LAYER</h3>
              
              <div className="debug-control">
                <label>Count: <span>{debugParams.smokeGroundCount.toFixed(0)}</span></label>
                <input type="range" min="0" max="30" step="1" value={debugParams.smokeGroundCount} onChange={(e) => updateParam('smokeGroundCount', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Opacity: <span>{debugParams.smokeGroundOpacity.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeGroundOpacity} onChange={(e) => updateParam('smokeGroundOpacity', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Size: <span>{debugParams.smokeGroundSize.toFixed(1)}</span></label>
                <input type="range" min="1" max="60" step="0.5" value={debugParams.smokeGroundSize} onChange={(e) => updateParam('smokeGroundSize', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Spread: <span>{debugParams.smokeGroundSpread.toFixed(0)}</span></label>
                <input type="range" min="10" max="200" step="1" value={debugParams.smokeGroundSpread} onChange={(e) => updateParam('smokeGroundSpread', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Height: <span>{debugParams.smokeGroundHeight.toFixed(1)}</span></label>
                <input type="range" min="-20" max="10" step="0.5" value={debugParams.smokeGroundHeight} onChange={(e) => updateParam('smokeGroundHeight', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Speed: <span>{debugParams.smokeGroundSpeed.toFixed(2)}</span></label>
                <input type="range" min="0" max="2" step="0.01" value={debugParams.smokeGroundSpeed} onChange={(e) => updateParam('smokeGroundSpeed', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color R: <span>{debugParams.smokeGroundColorR.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeGroundColorR} onChange={(e) => updateParam('smokeGroundColorR', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color G: <span>{debugParams.smokeGroundColorG.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeGroundColorG} onChange={(e) => updateParam('smokeGroundColorG', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color B: <span>{debugParams.smokeGroundColorB.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeGroundColorB} onChange={(e) => updateParam('smokeGroundColorB', parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="debug-section">
              <h3>MID WISPS LAYER</h3>
              
              <div className="debug-control">
                <label>Count: <span>{debugParams.smokeMidCount.toFixed(0)}</span></label>
                <input type="range" min="0" max="30" step="1" value={debugParams.smokeMidCount} onChange={(e) => updateParam('smokeMidCount', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Opacity: <span>{debugParams.smokeMidOpacity.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeMidOpacity} onChange={(e) => updateParam('smokeMidOpacity', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Size: <span>{debugParams.smokeMidSize.toFixed(1)}</span></label>
                <input type="range" min="1" max="60" step="0.5" value={debugParams.smokeMidSize} onChange={(e) => updateParam('smokeMidSize', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Spread: <span>{debugParams.smokeMidSpread.toFixed(0)}</span></label>
                <input type="range" min="10" max="200" step="1" value={debugParams.smokeMidSpread} onChange={(e) => updateParam('smokeMidSpread', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Height: <span>{debugParams.smokeMidHeight.toFixed(1)}</span></label>
                <input type="range" min="-10" max="20" step="0.5" value={debugParams.smokeMidHeight} onChange={(e) => updateParam('smokeMidHeight', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Speed: <span>{debugParams.smokeMidSpeed.toFixed(2)}</span></label>
                <input type="range" min="0" max="2" step="0.01" value={debugParams.smokeMidSpeed} onChange={(e) => updateParam('smokeMidSpeed', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color R: <span>{debugParams.smokeMidColorR.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeMidColorR} onChange={(e) => updateParam('smokeMidColorR', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color G: <span>{debugParams.smokeMidColorG.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeMidColorG} onChange={(e) => updateParam('smokeMidColorG', parseFloat(e.target.value))} />
              </div>
              <div className="debug-control">
                <label>Color B: <span>{debugParams.smokeMidColorB.toFixed(2)}</span></label>
                <input type="range" min="0" max="1" step="0.01" value={debugParams.smokeMidColorB} onChange={(e) => updateParam('smokeMidColorB', parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="debug-section">
              <h3>START BUTTON</h3>
              
              <div className="debug-control">
                <label>Scale: <span>{debugParams.buttonScale.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.buttonScale}
                  onChange={(e) => updateParam('buttonScale', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position X (%): <span>{debugParams.buttonPositionX.toFixed(0)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={debugParams.buttonPositionX}
                  onChange={(e) => updateParam('buttonPositionX', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Position Y (%): <span>{debugParams.buttonPositionY.toFixed(0)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={debugParams.buttonPositionY}
                  onChange={(e) => updateParam('buttonPositionY', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Font Size: <span>{debugParams.buttonFontSize.toFixed(0)}px</span></label>
                <input 
                  type="range" 
                  min="12" 
                  max="48" 
                  step="1" 
                  value={debugParams.buttonFontSize}
                  onChange={(e) => updateParam('buttonFontSize', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'bulletTime' && (
          <>
            <div className="debug-section">
              <h3>BULLET TIME TIMING</h3>
              
              <div className="debug-control">
                <label>Windup Duration: <span>{debugParams.cinematicWindupDuration.toFixed(2)}s</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.1" 
                  value={debugParams.cinematicWindupDuration}
                  onChange={(e) => updateParam('cinematicWindupDuration', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Freeze Duration: <span>{debugParams.cinematicFreezeDuration.toFixed(2)}s</span></label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.05" 
                  value={debugParams.cinematicFreezeDuration}
                  onChange={(e) => updateParam('cinematicFreezeDuration', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Orbit Duration: <span>{debugParams.cinematicOrbitDuration.toFixed(2)}s</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.2" 
                  value={debugParams.cinematicOrbitDuration}
                  onChange={(e) => updateParam('cinematicOrbitDuration', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Reveal Duration: <span>{debugParams.cinematicRevealDuration.toFixed(2)}s</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.1" 
                  value={debugParams.cinematicRevealDuration}
                  onChange={(e) => updateParam('cinematicRevealDuration', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>BULLET TIME CAMERA</h3>
              
              <div className="debug-control">
                <label>Orbit Radius: <span>{debugParams.cinematicOrbitRadius.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  step="0.5" 
                  value={debugParams.cinematicOrbitRadius}
                  onChange={(e) => updateParam('cinematicOrbitRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Orbit Height: <span>{debugParams.cinematicOrbitHeight.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.2" 
                  value={debugParams.cinematicOrbitHeight}
                  onChange={(e) => updateParam('cinematicOrbitHeight', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>BULLET TIME TIME SCALE</h3>
              
              <div className="debug-control">
                <label>Slow Motion Scale: <span>{debugParams.cinematicTimeScaleSlow.toFixed(3)}</span></label>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.5" 
                  step="0.01" 
                  value={debugParams.cinematicTimeScaleSlow}
                  onChange={(e) => updateParam('cinematicTimeScaleSlow', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Freeze Scale: <span>{debugParams.cinematicTimeScaleFreeze.toFixed(3)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.1" 
                  step="0.001" 
                  value={debugParams.cinematicTimeScaleFreeze}
                  onChange={(e) => updateParam('cinematicTimeScaleFreeze', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>COMET ZOOM EFFECTS</h3>
              
              <div className="debug-control">
                <label>Approach Speed: <span>{debugParams.cinematicCometApproachSpeed.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5" 
                  value={debugParams.cinematicCometApproachSpeed}
                  onChange={(e) => updateParam('cinematicCometApproachSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Start Distance: <span>{debugParams.cinematicCometStartDistance.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  step="2" 
                  value={debugParams.cinematicCometStartDistance}
                  onChange={(e) => updateParam('cinematicCometStartDistance', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>End Distance: <span>{debugParams.cinematicCometEndDistance.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.5" 
                  value={debugParams.cinematicCometEndDistance}
                  onChange={(e) => updateParam('cinematicCometEndDistance', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>FOV Punch: <span>{debugParams.cinematicCometFOVPunch.toFixed(0)}°</span></label>
                <input 
                  type="range" 
                  min="60" 
                  max="150" 
                  step="5" 
                  value={debugParams.cinematicCometFOVPunch}
                  onChange={(e) => updateParam('cinematicCometFOVPunch', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Shake Intensity: <span>{debugParams.cinematicCometShakeIntensity.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={debugParams.cinematicCometShakeIntensity}
                  onChange={(e) => updateParam('cinematicCometShakeIntensity', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>POG EXPLOSION & SCATTER</h3>
              
              <div className="debug-control">
                <label>Explosion Force: <span>{debugParams.cinematicExplosionForce.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="2" 
                  value={debugParams.cinematicExplosionForce}
                  onChange={(e) => updateParam('cinematicExplosionForce', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Scatter Radius: <span>{debugParams.cinematicScatterRadius.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  step="1" 
                  value={debugParams.cinematicScatterRadius}
                  onChange={(e) => updateParam('cinematicScatterRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Scatter Height: <span>{debugParams.cinematicScatterHeight.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="0.5" 
                  value={debugParams.cinematicScatterHeight}
                  onChange={(e) => updateParam('cinematicScatterHeight', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Pog Rotation Speed: <span>{debugParams.cinematicPogRotationSpeed.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1" 
                  value={debugParams.cinematicPogRotationSpeed}
                  onChange={(e) => updateParam('cinematicPogRotationSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Float Duration: <span>{debugParams.cinematicPogFloatDuration.toFixed(1)}s</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.5" 
                  value={debugParams.cinematicPogFloatDuration}
                  onChange={(e) => updateParam('cinematicPogFloatDuration', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>DRAMATIC TRANSITIONS</h3>
              
              <div className="debug-control">
                <label>Transition Speed: <span>{debugParams.cinematicTransitionSpeed.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.2" 
                  value={debugParams.cinematicTransitionSpeed}
                  onChange={(e) => updateParam('cinematicTransitionSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Impact Flash Intensity: <span>{debugParams.cinematicImpactFlashIntensity.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5" 
                  value={debugParams.cinematicImpactFlashIntensity}
                  onChange={(e) => updateParam('cinematicImpactFlashIntensity', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Motion Blur Strength: <span>{debugParams.cinematicMotionBlurStrength.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.cinematicMotionBlurStrength}
                  onChange={(e) => updateParam('cinematicMotionBlurStrength', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>POG LOCK-ON TRACKING</h3>
              
              <div className="debug-control">
                <label>Enable Lock-on: <span>{debugParams.cinematicLockOnEnabled ? 'ON' : 'OFF'}</span></label>
                <input 
                  type="checkbox" 
                  checked={debugParams.cinematicLockOnEnabled}
                  onChange={(e) => updateParam('cinematicLockOnEnabled', e.target.checked ? 1 : 0)}
                />
              </div>

              <div className="debug-control">
                <label>Lock Duration: <span>{debugParams.cinematicLockOnDuration.toFixed(1)}s</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.5" 
                  value={debugParams.cinematicLockOnDuration}
                  onChange={(e) => updateParam('cinematicLockOnDuration', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Orbit Radius: <span>{debugParams.cinematicLockOnOrbitRadius.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.5" 
                  value={debugParams.cinematicLockOnOrbitRadius}
                  onChange={(e) => updateParam('cinematicLockOnOrbitRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Orbit Speed: <span>{debugParams.cinematicLockOnOrbitSpeed.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.2" 
                  max="5" 
                  step="0.2" 
                  value={debugParams.cinematicLockOnOrbitSpeed}
                  onChange={(e) => updateParam('cinematicLockOnOrbitSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Height Offset: <span>{debugParams.cinematicLockOnHeightOffset.toFixed(1)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.2" 
                  value={debugParams.cinematicLockOnHeightOffset}
                  onChange={(e) => updateParam('cinematicLockOnHeightOffset', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Smooth Factor: <span>{debugParams.cinematicLockOnSmoothFactor.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.cinematicLockOnSmoothFactor}
                  onChange={(e) => updateParam('cinematicLockOnSmoothFactor', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="debug-section">
              <h3>SYNCHRONIZED FALLING & REST</h3>
              
              <div className="debug-control">
                <label>Fall Duration: <span>{debugParams.cinematicSyncFallDuration.toFixed(1)}s</span></label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.2" 
                  value={debugParams.cinematicSyncFallDuration}
                  onChange={(e) => updateParam('cinematicSyncFallDuration', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Fall Speed: <span>{debugParams.cinematicSyncFallSpeed.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.cinematicSyncFallSpeed}
                  onChange={(e) => updateParam('cinematicSyncFallSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Rest Delay: <span>{debugParams.cinematicSyncRestDelay.toFixed(1)}s</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="0.2" 
                  value={debugParams.cinematicSyncRestDelay}
                  onChange={(e) => updateParam('cinematicSyncRestDelay', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Face Up Chance: <span>{(debugParams.cinematicFinalFaceUpChance * 100).toFixed(0)}%</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.cinematicFinalFaceUpChance}
                  onChange={(e) => updateParam('cinematicFinalFaceUpChance', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Bounce Count: <span>{debugParams.cinematicBounceCount.toFixed(0)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="1" 
                  value={debugParams.cinematicBounceCount}
                  onChange={(e) => updateParam('cinematicBounceCount', parseFloat(e.target.value))}
                />
              </div>

              <div className="debug-control">
                <label>Bounce Damping: <span>{debugParams.cinematicBounceDamping.toFixed(2)}</span></label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={debugParams.cinematicBounceDamping}
                  onChange={(e) => updateParam('cinematicBounceDamping', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'arena' && (
          <div className="debug-section">
            <h3>ARENA SETTINGS</h3>
            
            <div className="debug-control">
              <label>Directional Light: <span>{debugParams.arenaLightIntensity.toFixed(1)}</span></label>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="0.1" 
                value={debugParams.arenaLightIntensity}
                onChange={(e) => updateParam('arenaLightIntensity', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Ambient Light: <span>{debugParams.arenaAmbientIntensity.toFixed(1)}</span></label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={debugParams.arenaAmbientIntensity}
                onChange={(e) => updateParam('arenaAmbientIntensity', parseFloat(e.target.value))}
              />
            </div>

            <div className="debug-control">
              <label>Floor Y Position: <span>{debugParams.floorPositionY.toFixed(2)}</span></label>
              <input 
                type="range" 
                min="-2" 
                max="2" 
                step="0.05" 
                value={debugParams.floorPositionY}
                onChange={(e) => updateParam('floorPositionY', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="debug-panel-footer">
        <button onClick={resetToDefaults}>Reset to Defaults</button>
        <button onClick={exportParams}>Export JSON</button>
        <button onClick={importParams}>Import JSON</button>
      </div>
    </div>
  );
}






