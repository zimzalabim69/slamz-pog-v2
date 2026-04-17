import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { DebugParams } from '../../store/useGameStore';
import { DEFAULT_DEBUG_PARAMS } from '../../store/useGameStore';
import { EnhancedSlider } from './EnhancedSlider';
import { BooleanToggle } from './BooleanToggle';
import './DebugPanel.css';
import './EnhancedSlider.css';
import './BooleanToggle.css';

type TabType = 'physics' | 'visual' | 'camera' | 'fog' | 'gameplay' | 'startScreen' | 'arena' | 'bulletTime' | 'tuning' | 'arcadeCabinet' | 'proTour' | 'wraith' | 'wraithArena' | 'json';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const debugParams = useGameStore((state) => state.debugParams);
  const setDebugParams = useGameStore((state) => state.setDebugParams);
  const autoSlamActive = useGameStore((state) => state.autoSlamActive);
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
    setActiveTab('json');
    console.group('🛠️ SLAMZ DEBUG EXPORT');
    console.log(JSON.stringify(debugParams, null, 2));
    console.groupEnd();
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
        <button 
          className={activeTab === 'bulletTime' ? 'active' : ''} 
          onClick={() => setActiveTab('bulletTime')}
        >
          BULLET TIME
        </button>
        <button 
          className={activeTab === 'tuning' ? 'active' : ''} 
          onClick={() => setActiveTab('tuning')}
        >
          🛠️ TUNING
        </button>
        <button 
          className={activeTab === 'arcadeCabinet' ? 'active' : ''} 
          onClick={() => setActiveTab('arcadeCabinet')}
        >
          ARCADE CABINET
        </button>
        <button 
          className={activeTab === 'proTour' ? 'active' : ''} 
          onClick={() => setActiveTab('proTour')}
        >
          🕹️ PRO TOUR
        </button>
        <button 
          className={activeTab === 'wraith' ? 'active' : ''} 
          onClick={() => setActiveTab('wraith')}
        >
          👻 PLAYER WRAITH
        </button>
        <button 
          className={activeTab === 'wraithArena' ? 'active' : ''} 
          onClick={() => setActiveTab('wraithArena')}
        >
          🌀 ARENA WRAITH
        </button>
        <button 
          className={activeTab === 'json' ? 'active' : ''} 
          onClick={() => setActiveTab('json')}
          style={{ border: '1px solid #00ffff', color: '#00ffff', fontWeight: 'bold' }}
        >
          📋 RAW JSON
        </button>
      </div>

      <div className="debug-panel-content">
        {activeTab === 'physics' && (
          <>
            <div className="debug-section">
              <h3>POG PHYSICS</h3>
              
              <EnhancedSlider
                label="Mass"
                value={debugParams.pogMass}
                min={0.1}
                max={120}
                step={0.1}
                onChange={(value) => updateParam('pogMass', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Restitution (Bounce)"
                value={debugParams.pogRestitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('pogRestitution', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Friction"
                value={debugParams.pogFriction}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => updateParam('pogFriction', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Linear Damping"
                value={debugParams.pogLinearDamping}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('pogLinearDamping', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Angular Damping"
                value={debugParams.pogAngularDamping}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('pogAngularDamping', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="MAX VELOCITY (Brakes)"
                value={debugParams.pogMaxVelocity}
                min={1}
                max={100}
                step={0.5}
                onChange={(value) => updateParam('pogMaxVelocity', value)}
                decimals={1}
                unit="m/s"
              />
            </div>

            <div className="debug-section">
              <h3>SLAMMER PHYSICS</h3>
              
              <EnhancedSlider
                label="Mass"
                value={debugParams.slammerMass}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(value) => updateParam('slammerMass', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Restitution"
                value={debugParams.slammerRestitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('slammerRestitution', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Friction"
                value={debugParams.slammerFriction}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => updateParam('slammerFriction', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Base Slam Force"
                value={debugParams.slamBaseForce}
                min={-50}
                max={0}
                step={1}
                onChange={(value) => updateParam('slamBaseForce', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Power Multiplier"
                value={debugParams.slamPowerMultiplier}
                min={-1}
                max={0}
                step={0.05}
                onChange={(value) => updateParam('slamPowerMultiplier', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Shatter Radius"
                value={debugParams.shatterRadius}
                min={0.1}
                max={120}
                step={0.05}
                onChange={(value) => updateParam('shatterRadius', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Shatter Force Min"
                value={debugParams.shatterForceMin}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => updateParam('shatterForceMin', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Shatter Force Max"
                value={debugParams.shatterForceMax}
                min={0}
                max={3}
                step={0.1}
                onChange={(value) => updateParam('shatterForceMax', value)}
                decimals={2}
              />
            </div>
          </>
        )}

        {activeTab === 'visual' && (
          <>
            <div className="debug-section">
              <h3>SLAMMER VISUALS</h3>
              
              <EnhancedSlider
                label="Ghost Opacity"
                value={debugParams.slammerOpacity}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('slammerOpacity', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Power Scale Boost"
                value={debugParams.slammerScaleBoost}
                min={0}
                max={0.5}
                step={0.05}
                onChange={(value) => updateParam('slammerScaleBoost', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Emissive Intensity"
                value={debugParams.slammerEmissiveIntensity}
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => updateParam('slammerEmissiveIntensity', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>POG VISUALS</h3>
              
              <EnhancedSlider
                label="Scale"
                value={debugParams.pogScale}
                min={0.5}
                max={2}
                step={0.1}
                onChange={(value) => updateParam('pogScale', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation Speed"
                value={debugParams.pogRotationSpeed}
                min={0}
                max={0.02}
                step={0.001}
                onChange={(value) => updateParam('pogRotationSpeed', value)}
                decimals={3}
              />

              <EnhancedSlider
                label="Metalness"
                value={debugParams.pogMetalness}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('pogMetalness', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Roughness"
                value={debugParams.pogRoughness}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('pogRoughness', value)}
                decimals={2}
              />
            </div>
          </>
        )}

        {activeTab === 'camera' && (
          <div className="debug-section">
            <h3>CAMERA SETTINGS</h3>
            
            <EnhancedSlider
                label="Base FOV"
                value={debugParams.baseFOV}
                min={30}
                max={90}
                step={1}
                onChange={(value) => updateParam('baseFOV', value)}
                decimals={0}
                unit="°"
              />

              <EnhancedSlider
                label="Punch FOV"
                value={debugParams.punchFOV}
                min={30}
                max={120}
                step={1}
                onChange={(value) => updateParam('punchFOV', value)}
                decimals={0}
                unit="°"
              />

              <EnhancedSlider
                label="FOV Lerp Speed"
                value={debugParams.fovLerpSpeed}
                min={0.01}
                max={0.5}
                step={0.01}
                onChange={(value) => updateParam('fovLerpSpeed', value)}
                decimals={2}
              />
          </div>
        )}

        {activeTab === 'fog' && (
          <div className="debug-section">
            <h3>FOG SETTINGS</h3>
            
            <EnhancedSlider
                label="Density"
                value={debugParams.fogDensity}
                min={0}
                max={0.1}
                step={0.001}
                onChange={(value) => updateParam('fogDensity', value)}
                decimals={3}
              />

              <EnhancedSlider
                label="Near"
                value={debugParams.fogNear}
                min={0}
                max={20}
                step={0.5}
                onChange={(value) => updateParam('fogNear', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Far"
                value={debugParams.fogFar}
                min={10}
                max={200}
                step={5}
                onChange={(value) => updateParam('fogFar', value)}
                decimals={0}
              />
          </div>
        )}

        {activeTab === 'gameplay' && (
          <div className="debug-section">
            <h3>GAMEPLAY TUNING</h3>
            
            <EnhancedSlider
                label="Power Charge Speed"
                value={debugParams.powerChargeSpeed}
                min={50}
                max={500}
                step={10}
                onChange={(value) => updateParam('powerChargeSpeed', value)}
                decimals={0}
              />

              <EnhancedSlider
                label="Slam Impact Delay (ms)"
                value={debugParams.slamDelay}
                min={0}
                max={500}
                step={50}
                onChange={(value) => updateParam('slamDelay', value)}
                decimals={0}
              />
          </div>
        )}

        {activeTab === 'startScreen' && (
          <>
            <div className="debug-section">
              <h3>LOGO 3D</h3>
              
              <EnhancedSlider
                label="Scale"
                value={debugParams.logoScale}
                min={0.1}
                max={120}
                step={0.1}
                onChange={(value) => updateParam('logoScale', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position X"
                value={debugParams.logoPositionX}
                min={-200}
                max={200}
                step={0.1}
                onChange={(value) => updateParam('logoPositionX', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position Y"
                value={debugParams.logoPositionY}
                min={-200}
                max={200}
                step={0.1}
                onChange={(value) => updateParam('logoPositionY', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position Z"
                value={debugParams.logoPositionZ}
                min={-400}
                max={400}
                step={0.1}
                onChange={(value) => updateParam('logoPositionZ', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation X"
                value={debugParams.logoRotationX}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('logoRotationX', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation Y"
                value={debugParams.logoRotationY}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('logoRotationY', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation Z"
                value={debugParams.logoRotationZ}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('logoRotationZ', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>BACKGROUND 3D</h3>
              
              <EnhancedSlider
                label="Scale"
                value={debugParams.bgScale}
                min={0.01}
                max={50}
                step={0.1}
                onChange={(value) => updateParam('bgScale', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position X"
                value={debugParams.bgPositionX}
                min={-200}
                max={200}
                step={0.5}
                onChange={(value) => updateParam('bgPositionX', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position Y"
                value={debugParams.bgPositionY}
                min={-200}
                max={200}
                step={0.5}
                onChange={(value) => updateParam('bgPositionY', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position Z"
                value={debugParams.bgPositionZ}
                min={-500}
                max={100}
                step={0.5}
                onChange={(value) => updateParam('bgPositionZ', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation X"
                value={debugParams.bgRotationX}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('bgRotationX', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation Y"
                value={debugParams.bgRotationY}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('bgRotationY', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Rotation Z"
                value={debugParams.bgRotationZ}
                min={-12.56}
                max={12.56}
                step={0.1}
                onChange={(value) => updateParam('bgRotationZ', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>SCENE FOG</h3>
              
              <EnhancedSlider
                label="Density"
                value={debugParams.startFogDensity}
                min={0}
                max={0.1}
                step={0.0005}
                onChange={(value) => updateParam('startFogDensity', value)}
                decimals={4}
              />

              <EnhancedSlider
                label="Color R"
                value={debugParams.startFogColorR}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('startFogColorR', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color G"
                value={debugParams.startFogColorG}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('startFogColorG', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color B"
                value={debugParams.startFogColorB}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('startFogColorB', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>GROUND FOG LAYER</h3>
              
              <EnhancedSlider
                label="Count"
                value={debugParams.smokeGroundCount}
                min={0}
                max={30}
                step={1}
                onChange={(value) => updateParam('smokeGroundCount', value)}
                decimals={0}
              />

              <EnhancedSlider
                label="Opacity"
                value={debugParams.smokeGroundOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeGroundOpacity', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Size"
                value={debugParams.smokeGroundSize}
                min={1}
                max={60}
                step={0.5}
                onChange={(value) => updateParam('smokeGroundSize', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Spread"
                value={debugParams.smokeGroundSpread}
                min={10}
                max={200}
                step={1}
                onChange={(value) => updateParam('smokeGroundSpread', value)}
                decimals={0}
              />

              <EnhancedSlider
                label="Height"
                value={debugParams.smokeGroundHeight}
                min={-20}
                max={10}
                step={0.5}
                onChange={(value) => updateParam('smokeGroundHeight', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Speed"
                value={debugParams.smokeGroundSpeed}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateParam('smokeGroundSpeed', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color R"
                value={debugParams.smokeGroundColorR}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeGroundColorR', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color G"
                value={debugParams.smokeGroundColorG}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeGroundColorG', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color B"
                value={debugParams.smokeGroundColorB}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeGroundColorB', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>MID WISPS LAYER</h3>
              
              <EnhancedSlider
                label="Count"
                value={debugParams.smokeMidCount}
                min={0}
                max={30}
                step={1}
                onChange={(value) => updateParam('smokeMidCount', value)}
                decimals={0}
              />

              <EnhancedSlider
                label="Opacity"
                value={debugParams.smokeMidOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeMidOpacity', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Size"
                value={debugParams.smokeMidSize}
                min={1}
                max={60}
                step={0.5}
                onChange={(value) => updateParam('smokeMidSize', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Spread"
                value={debugParams.smokeMidSpread}
                min={10}
                max={200}
                step={1}
                onChange={(value) => updateParam('smokeMidSpread', value)}
                decimals={0}
              />

              <EnhancedSlider
                label="Height"
                value={debugParams.smokeMidHeight}
                min={-20}
                max={10}
                step={0.5}
                onChange={(value) => updateParam('smokeMidHeight', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Speed"
                value={debugParams.smokeMidSpeed}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => updateParam('smokeMidSpeed', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color R"
                value={debugParams.smokeMidColorR}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeMidColorR', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color G"
                value={debugParams.smokeMidColorG}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeMidColorG', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Color B"
                value={debugParams.smokeMidColorB}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => updateParam('smokeMidColorB', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>START BUTTON</h3>
              
              <EnhancedSlider
                label="Scale"
                value={debugParams.buttonScale}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(value) => updateParam('buttonScale', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Position X"
                value={debugParams.buttonPositionX}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => updateParam('buttonPositionX', value)}
                decimals={0}
                unit="%"
              />

              <EnhancedSlider
                label="Position Y"
                value={debugParams.buttonPositionY}
                min={70}
                max={98}
                step={1}
                onChange={(value) => updateParam('buttonPositionY', value)}
                decimals={0}
                unit="%"
              />

              <EnhancedSlider
                label="Font Size"
                value={debugParams.buttonFontSize}
                min={8}
                max={48}
                step={1}
                onChange={(value) => updateParam('buttonFontSize', value)}
                decimals={0}
                unit="px"
              />
            </div>
          </>
        )}

        {activeTab === 'bulletTime' && (
          <>
            <div className="debug-section">
              <h3>BULLET TIME TIMING</h3>
              
              <EnhancedSlider
                label="Windup Duration"
                value={debugParams.cinematicWindupDuration}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(value) => updateParam('cinematicWindupDuration', value)}
                decimals={2}
                unit="s"
              />

              <EnhancedSlider
                label="Freeze Duration"
                value={debugParams.cinematicFreezeDuration}
                min={0.1}
                max={2}
                step={0.05}
                onChange={(value) => updateParam('cinematicFreezeDuration', value)}
                decimals={2}
                unit="s"
              />

              <EnhancedSlider
                label="Orbit Duration"
                value={debugParams.cinematicOrbitDuration}
                min={1}
                max={8}
                step={0.2}
                onChange={(value) => updateParam('cinematicOrbitDuration', value)}
                decimals={2}
                unit="s"
              />

              <EnhancedSlider
                label="Reveal Duration"
                value={debugParams.cinematicRevealDuration}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(value) => updateParam('cinematicRevealDuration', value)}
                decimals={2}
                unit="s"
              />
            </div>

            <div className="debug-section">
              <h3>BULLET TIME CAMERA</h3>
              
              <EnhancedSlider
                label="Orbit Radius"
                value={debugParams.cinematicOrbitRadius}
                min={2}
                max={20}
                step={0.5}
                onChange={(value) => updateParam('cinematicOrbitRadius', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Orbit Height"
                value={debugParams.cinematicOrbitHeight}
                min={0.5}
                max={10}
                step={0.2}
                onChange={(value) => updateParam('cinematicOrbitHeight', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Dynamic Zoom Mult"
                value={debugParams.cinematicDynamicZoomMultiplier}
                min={1}
                max={5}
                step={0.1}
                onChange={(value) => updateParam('cinematicDynamicZoomMultiplier', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Dynamic Zoom Max Scale"
                value={debugParams.cinematicDynamicZoomMaxScale}
                min={1}
                max={3}
                step={0.05}
                onChange={(value) => updateParam('cinematicDynamicZoomMaxScale', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Slow Motion Scale"
                value={debugParams.cinematicTimeScaleSlow}
                min={0.01}
                max={0.5}
                step={0.01}
                onChange={(value) => updateParam('cinematicTimeScaleSlow', value)}
                decimals={3}
              />

              <EnhancedSlider
                label="Freeze Scale"
                value={debugParams.cinematicTimeScaleFreeze}
                min={0}
                max={0.1}
                step={0.001}
                onChange={(value) => updateParam('cinematicTimeScaleFreeze', value)}
                decimals={3}
              />
            </div>

            <div className="debug-section">
              <h3>COMET ZOOM EFFECTS</h3>
              
              <EnhancedSlider
                label="Approach Speed"
                value={debugParams.cinematicCometApproachSpeed}
                min={10}
                max={100}
                step={1}
                onChange={(value) => updateParam('cinematicCometApproachSpeed', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Start Distance"
                value={debugParams.cinematicCometStartDistance}
                min={10}
                max={50}
                step={1}
                onChange={(value) => updateParam('cinematicCometStartDistance', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="End Distance"
                value={debugParams.cinematicCometEndDistance}
                min={0.5}
                max={10}
                step={0.5}
                onChange={(value) => updateParam('cinematicCometEndDistance', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="FOV Punch"
                value={debugParams.cinematicCometFOVPunch}
                min={60}
                max={150}
                step={1}
                onChange={(value) => updateParam('cinematicCometFOVPunch', value)}
                decimals={0}
                unit="°"
              />

              <EnhancedSlider
                label="Shake Intensity"
                value={debugParams.cinematicCometShakeIntensity}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => updateParam('cinematicCometShakeIntensity', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>POG EXPLOSION & SCATTER</h3>
              
              <EnhancedSlider
                label="Explosion Force"
                value={debugParams.cinematicExplosionForce}
                min={5}
                max={50}
                step={1}
                onChange={(value) => updateParam('cinematicExplosionForce', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Scatter Radius"
                value={debugParams.cinematicScatterRadius}
                min={2}
                max={20}
                step={1}
                onChange={(value) => updateParam('cinematicScatterRadius', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Scatter Height"
                value={debugParams.cinematicScatterHeight}
                min={1}
                max={15}
                step={1}
                onChange={(value) => updateParam('cinematicScatterHeight', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Rotation Speed"
                value={debugParams.cinematicPogRotationSpeed}
                min={0}
                max={20}
                step={1}
                onChange={(value) => updateParam('cinematicPogRotationSpeed', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Float Duration"
                value={debugParams.cinematicPogFloatDuration}
                min={1}
                max={8}
                step={1}
                onChange={(value) => updateParam('cinematicPogFloatDuration', value)}
                decimals={1}
                unit="s"
              />
            </div>

            <div className="debug-section">
              <h3>DRAMATIC TRANSITIONS</h3>
              
              <EnhancedSlider
                label="Transition Speed"
                value={debugParams.cinematicTransitionSpeed}
                min={0.5}
                max={5}
                step={0.2}
                onChange={(value) => updateParam('cinematicTransitionSpeed', value)}
                decimals={2}
              />

              <EnhancedSlider
                label="Impact Flash"
                value={debugParams.cinematicImpactFlashIntensity}
                min={0}
                max={10}
                step={0.5}
                onChange={(value) => updateParam('cinematicImpactFlashIntensity', value)}
                decimals={1}
              />

              <EnhancedSlider
                label="Motion Blur"
                value={debugParams.cinematicMotionBlurStrength}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => updateParam('cinematicMotionBlurStrength', value)}
                decimals={2}
              />
            </div>

            <div className="debug-section">
              <h3>POG LOCK-ON TRACKING</h3>
              
              <BooleanToggle
              label="Enable Lock-on"
              value={debugParams.cinematicLockOnEnabled}
              onChange={(value) => updateParam('cinematicLockOnEnabled', value ? 1 : 0)}
            />

            <EnhancedSlider
              label="Lock Duration"
              value={debugParams.cinematicLockOnDuration}
              min={1}
              max={8}
              step={0.5}
              onChange={(value) => updateParam('cinematicLockOnDuration', value)}
              decimals={1}
              unit="s"
            />

            <EnhancedSlider
              label="Orbit Radius"
              value={debugParams.cinematicLockOnOrbitRadius}
              min={1}
              max={10}
              step={0.5}
              onChange={(value) => updateParam('cinematicLockOnOrbitRadius', value)}
              decimals={1}
            />

            <EnhancedSlider
              label="Orbit Speed"
              value={debugParams.cinematicLockOnOrbitSpeed}
              min={0.2}
              max={5}
              step={0.2}
              onChange={(value) => updateParam('cinematicLockOnOrbitSpeed', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Height Offset"
              value={debugParams.cinematicLockOnHeightOffset}
              min={0}
              max={5}
              step={0.2}
              onChange={(value) => updateParam('cinematicLockOnHeightOffset', value)}
              decimals={1}
            />

            <EnhancedSlider
              label="Smooth Factor"
              value={debugParams.cinematicLockOnSmoothFactor}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(value) => updateParam('cinematicLockOnSmoothFactor', value)}
              decimals={2}
            />
            </div>

            <div className="debug-section">
              <h3>SYNCHRONIZED FALLING & REST</h3>
              
              <EnhancedSlider
              label="Fall Duration"
              value={debugParams.cinematicSyncFallDuration}
              min={0.5}
              max={5}
              step={0.2}
              onChange={(value) => updateParam('cinematicSyncFallDuration', value)}
              decimals={1}
              unit="s"
            />

            <EnhancedSlider
              label="Fall Speed"
              value={debugParams.cinematicSyncFallSpeed}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(value) => updateParam('cinematicSyncFallSpeed', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rest Delay"
              value={debugParams.cinematicSyncRestDelay}
              min={0}
              max={3}
              step={0.2}
              onChange={(value) => updateParam('cinematicSyncRestDelay', value)}
              decimals={1}
              unit="s"
            />

            <EnhancedSlider
              label="Face Up Chance"
              value={debugParams.cinematicFinalFaceUpChance}
              min={0}
              max={1}
              step={0.05}
              onChange={(value) => updateParam('cinematicFinalFaceUpChance', value)}
              decimals={0}
              unit="%"
            />

            <EnhancedSlider
              label="Bounce Count"
              value={debugParams.cinematicBounceCount}
              min={0}
              max={5}
              step={1}
              onChange={(value) => updateParam('cinematicBounceCount', value)}
              decimals={0}
            />

            <EnhancedSlider
              label="Bounce Damping"
              value={debugParams.cinematicBounceDamping}
              min={0}
              max={1}
              step={0.05}
              onChange={(value) => updateParam('cinematicBounceDamping', value)}
              decimals={2}
            />
            </div>
          </>
        )}

        {activeTab === 'arena' && (
          <div className="debug-section">
            <h3>ARENA SETTINGS</h3>
            
            <EnhancedSlider
              label="Directional Light"
              value={debugParams.arenaLightIntensity}
              min={0}
              max={3}
              step={0.1}
              onChange={(value) => updateParam('arenaLightIntensity', value)}
              decimals={1}
            />

            <EnhancedSlider
              label="Ambient Light"
              value={debugParams.arenaAmbientIntensity}
              min={0}
              max={2}
              step={0.1}
              onChange={(value) => updateParam('arenaAmbientIntensity', value)}
              decimals={1}
            />

            <EnhancedSlider
              label="Floor Y Position"
              value={debugParams.floorPositionY}
              min={-2}
              max={2}
              step={0.05}
              onChange={(value) => updateParam('floorPositionY', value)}
              decimals={2}
            />
          </div>
        )}

        {activeTab === 'arcadeCabinet' && (
          <div className="debug-section">
            <h3>ARCADE FRONT (Slamz_Arcade.glb)</h3>
            
            <BooleanToggle
              label="Visible"
              value={debugParams.arcadeCabinetVisible}
              onChange={(value) => updateParam('arcadeCabinetVisible', value as any)}
            />

            <EnhancedSlider
              label="Scale"
              value={debugParams.arcadeCabinetScale}
              min={0.05}
              max={5}
              step={0.05}
              onChange={(value) => updateParam('arcadeCabinetScale', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position X"
              value={debugParams.arcadeCabinetPositionX}
              min={-20}
              max={20}
              step={0.25}
              onChange={(value) => updateParam('arcadeCabinetPositionX', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Y"
              value={debugParams.arcadeCabinetPositionY}
              min={-10}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('arcadeCabinetPositionY', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Z"
              value={debugParams.arcadeCabinetPositionZ}
              min={-25}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('arcadeCabinetPositionZ', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rotation Y"
              value={debugParams.arcadeCabinetRotationY}
              min={-3.14}
              max={3.14}
              step={0.1}
              onChange={(value) => updateParam('arcadeCabinetRotationY', value)}
              decimals={2}
            />

            <h3 style={{ marginTop: '24px' }}>ARCADE BACK (Slamz_Arcade_Back.glb)</h3>

            <BooleanToggle
              label="Visible"
              value={debugParams.arcadeBackVisible}
              onChange={(value) => updateParam('arcadeBackVisible', value as any)}
            />

            <EnhancedSlider
              label="Scale"
              value={debugParams.arcadeBackScale}
              min={0.05}
              max={5}
              step={0.05}
              onChange={(value) => updateParam('arcadeBackScale', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position X"
              value={debugParams.arcadeBackPositionX}
              min={-20}
              max={20}
              step={0.25}
              onChange={(value) => updateParam('arcadeBackPositionX', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Y"
              value={debugParams.arcadeBackPositionY}
              min={-10}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('arcadeBackPositionY', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Z"
              value={debugParams.arcadeBackPositionZ}
              min={-25}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('arcadeBackPositionZ', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rotation Y"
              value={debugParams.arcadeBackRotationY}
              min={-3.14}
              max={3.14}
              step={0.1}
              onChange={(value) => updateParam('arcadeBackRotationY', value)}
              decimals={2}
            />
          </div>
        )}

        {activeTab === 'tuning' && (
          <div className="debug-section">
            <h3>🛠️ COLLISION TUNING SUITE</h3>
            
            <BooleanToggle
              label="Enable Auto-Slam Loop"
              value={autoSlamActive}
              onChange={(value) => useGameStore.setState({ autoSlamActive: value })}
            />

            <EnhancedSlider
              label="Auto-Slam Power"
              value={debugParams.autoSlamPower}
              min={1}
              max={100}
              step={1}
              onChange={(value) => updateParam('autoSlamPower', value)}
              decimals={0}
              unit="%"
            />

            <div className="debug-divider" />
            
            <h3>SCENE ARCHITECTURE</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '15px' }}>
               <button 
                 onClick={() => useGameStore.getState().setSceneMode('ARCADE')}
                 style={{
                   flex: 1,
                   padding: '10px',
                   background: useGameStore.getState().sceneMode === 'ARCADE' ? '#00ffff' : 'rgba(0,0,0,0.5)',
                   color: useGameStore.getState().sceneMode === 'ARCADE' ? '#000' : '#00ffff',
                   border: '1px solid #00ffff',
                   cursor: 'pointer',
                   fontFamily: 'monospace',
                   fontSize: '10px',
                   fontWeight: '900'
                 }}
               >
                 [ ARCADE ]
               </button>
               <button 
                 onClick={() => useGameStore.getState().setSceneMode('LAB')}
                 style={{
                   flex: 1,
                   padding: '10px',
                   background: useGameStore.getState().sceneMode === 'LAB' ? '#00ffff' : 'rgba(0,0,0,0.5)',
                   color: useGameStore.getState().sceneMode === 'LAB' ? '#000' : '#00ffff',
                   border: '1px solid #00ffff',
                   cursor: 'pointer',
                   fontFamily: 'monospace',
                   fontSize: '10px',
                   fontWeight: '900'
                 }}
               >
                 [ LAB ]
               </button>
            </div>

            <div className="debug-divider" />

            <h3>PHYSICS ERUPTION</h3>
            
            <EnhancedSlider
              label="Upward Kick (Y Multiplier)"
              value={debugParams.eruptionUpwardMultiplier}
              min={0}
              max={10}
              step={0.1}
              onChange={(value) => updateParam('eruptionUpwardMultiplier', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Impact Radius"
              value={debugParams.eruptionRadius}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => updateParam('eruptionRadius', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Spin Intensity (Torque)"
              value={debugParams.eruptionTorqueMultiplier}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => updateParam('eruptionTorqueMultiplier', value)}
              decimals={2}
            />
          </div>
        )}
        {activeTab === 'wraith' && (
          <div className="debug-section">
            <h3>PLAYER WRAITH (Character)</h3>
            
            <EnhancedSlider
              label="Position X"
              value={debugParams.wraithPositionX}
              min={-50}
              max={50}
              step={0.1}
              onChange={(value) => updateParam('wraithPositionX', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Y"
              value={debugParams.wraithPositionY}
              min={-10}
              max={50}
              step={0.1}
              onChange={(value) => updateParam('wraithPositionY', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Z"
              value={debugParams.wraithPositionZ}
              min={-100}
              max={50}
              step={0.1}
              onChange={(value) => updateParam('wraithPositionZ', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Scale"
              value={debugParams.wraithScale}
              min={0.1}
              max={30}
              step={0.1}
              onChange={(value) => updateParam('wraithScale', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rotation Y"
              value={debugParams.wraithRotationY}
              min={-Math.PI * 2}
              max={Math.PI * 2}
              step={0.1}
              onChange={(value) => updateParam('wraithRotationY', value)}
              decimals={2}
            />
          </div>
        )}

        {activeTab === 'proTour' && (
          <div className="debug-section">
            <h3>SLAMZ PRO TOUR ARCADE (Slamz_Pro_Tour_Arcade.glb)</h3>

            <BooleanToggle
              label="Visible"
              value={debugParams.proTourVisible}
              onChange={(value) => updateParam('proTourVisible', value as any)}
            />

            <EnhancedSlider
              label="Scale"
              value={debugParams.proTourScale}
              min={0.05}
              max={5}
              step={0.05}
              onChange={(value) => updateParam('proTourScale', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position X"
              value={debugParams.proTourPositionX}
              min={-20}
              max={20}
              step={0.25}
              onChange={(value) => updateParam('proTourPositionX', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Y"
              value={debugParams.proTourPositionY}
              min={-10}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('proTourPositionY', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Z"
              value={debugParams.proTourPositionZ}
              min={-25}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('proTourPositionZ', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rotation Y"
              value={debugParams.proTourRotationY}
              min={-3.14}
              max={3.14}
              step={0.1}
              onChange={(value) => updateParam('proTourRotationY', value)}
              decimals={2}
            />
          </div>
        )}

        {activeTab === 'wraithArena' && (
          <div className="debug-section">
            <h3>ARENA WRAITH (Cyber Alley instance)</h3>

            <BooleanToggle
              label="Visible"
              value={debugParams.wraithArenaVisible}
              onChange={(value) => updateParam('wraithArenaVisible', value as any)}
            />

            <EnhancedSlider
              label="Scale"
              value={debugParams.wraithArenaScale}
              min={0.05}
              max={5}
              step={0.05}
              onChange={(value) => updateParam('wraithArenaScale', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position X"
              value={debugParams.wraithArenaPositionX}
              min={-20}
              max={20}
              step={0.25}
              onChange={(value) => updateParam('wraithArenaPositionX', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Y"
              value={debugParams.wraithArenaPositionY}
              min={-10}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('wraithArenaPositionY', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Position Z"
              value={debugParams.wraithArenaPositionZ}
              min={-25}
              max={15}
              step={0.25}
              onChange={(value) => updateParam('wraithArenaPositionZ', value)}
              decimals={2}
            />

            <EnhancedSlider
              label="Rotation Y"
              value={debugParams.wraithArenaRotationY}
              min={-3.14}
              max={3.14}
              step={0.1}
              onChange={(value) => updateParam('wraithArenaRotationY', value)}
              decimals={2}
            />
          </div>
        )}

        {activeTab === 'json' && (
          <div className="debug-tab-content">
            <h3 style={{ color: '#00ffff', marginBottom: '10px' }}>📋 LIVE CONFIGURATION</h3>
            <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '10px' }}>
              Copy the text below and paste it to Antigravity to "Bake In" these settings.
            </p>
            <textarea
              readOnly
              value={JSON.stringify(debugParams, null, 2)}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#050510',
                color: '#00ffcc',
                fontFamily: 'monospace',
                fontSize: '11px',
                border: '1px solid #333',
                padding: '10px',
                borderRadius: '4px',
                resize: 'none',
                outline: 'none'
              }}
            />
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








