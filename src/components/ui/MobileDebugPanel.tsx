/**
 * Mobile Debug Panel
 * Helps diagnose mobile rendering issues
 */

import { useState, useEffect } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { mobileLogger, logDeviceInfo } from '../utils/mobileLogger';
import { remoteLogger } from '../utils/remoteLogger';
import './MobileDebugPanel.css';

export const MobileDebugPanel = () => {
  const mobileInfo = useMobileDetection();
  const [webglInfo, setWebglInfo] = useState({
    supported: false,
    version: 'Unknown',
    renderer: 'Unknown',
    vendor: 'Unknown',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    // Log device info immediately
    const deviceInfo = logDeviceInfo();
    mobileLogger.log('MobileDebugPanel mounting', { mobileInfo, deviceInfo });
    // DISABLED: Remote logging to prevent infinite loop
    // remoteLogger.log('MobileDebugPanel mounting', { mobileInfo, deviceInfo });

    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          const context = gl as WebGLRenderingContext;
          const webglData = {
            supported: true,
            version: context.getParameter(context.VERSION),
            renderer: context.getParameter(context.RENDERER),
            vendor: context.getParameter(context.VENDOR),
          };
          setWebglInfo(webglData);
          mobileLogger.log('WebGL detected successfully', webglData);
          // DISABLED: Remote logging to prevent infinite loop
          // remoteLogger.log('WebGL detected successfully', webglData);
        } else {
          setWebglInfo(prev => ({ ...prev, supported: false }));
          mobileLogger.error('WebGL not supported');
          // DISABLED: Remote logging to prevent infinite loop
          // remoteLogger.error('WebGL not supported');
        }
      } catch (e) {
        setWebglInfo(prev => ({ ...prev, supported: false }));
        mobileLogger.error('WebGL detection failed', e);
        // DISABLED: Remote logging to prevent infinite loop
        // remoteLogger.error('WebGL detection failed', e);
      }
    };

    checkWebGL();
    
    // Always show debug panel for troubleshooting
    setIsVisible(true);
    mobileLogger.log('MobileDebugPanel visible and ready');
    // DISABLED: Remote logging to prevent infinite loop
    // remoteLogger.log('MobileDebugPanel visible and ready');

    // Capture console logs
    const originalConsole = { ...console };
    const captureLogs = () => {
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        originalConsole.log(...args);
        const message = args.join(' ');
        logs.push(`[LOG] ${message}`);
        setConsoleLogs([...logs.slice(-10)]); // Keep last 10 logs
        // DISABLED: Remote logging to prevent infinite loop
        // remoteLogger.log(message, args);
      };
      
      console.error = (...args: any[]) => {
        originalConsole.error(...args);
        const message = args.join(' ');
        logs.push(`[ERROR] ${message}`);
        setConsoleLogs([...logs.slice(-10)]);
        // DISABLED: Remote logging to prevent infinite loop
        // remoteLogger.error(message, args);
      };
      
      console.warn = (...args: any[]) => {
        originalConsole.warn(...args);
        const message = args.join(' ');
        logs.push(`[WARN] ${message}`);
        setConsoleLogs([...logs.slice(-10)]);
        // DISABLED: Remote logging to prevent infinite loop
        // remoteLogger.warn(message, args);
      };
    };
    
    captureLogs();
  }, [mobileInfo]);

  // Always show when visible
  if (!isVisible) return null;

  return (
    <div className="mobile-debug-panel">
      <div className="debug-header">
        <h3>Mobile Debug Info</h3>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsVisible(!isVisible);
          }}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
      
      <div className="debug-content">
        <div className="debug-section">
          <h4>Device Info</h4>
          <p>Mobile: {mobileInfo.isMobile ? 'Yes' : 'No'}</p>
          <p>Touch: {mobileInfo.isTouch ? 'Yes' : 'No'}</p>
          <p>Tablet: {mobileInfo.isTablet ? 'Yes' : 'No'}</p>
          <p>Orientation: {mobileInfo.orientation}</p>
          <p>Screen: {mobileInfo.screenWidth}x{mobileInfo.screenHeight}</p>
          <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
        </div>
        
        <div className="debug-section">
          <h4>WebGL Info</h4>
          <p>Supported: {webglInfo.supported ? 'Yes' : 'No'}</p>
          <p>Version: {webglInfo.version}</p>
          <p>Renderer: {webglInfo.renderer}</p>
          <p>Vendor: {webglInfo.vendor}</p>
        </div>
        
        <div className="debug-section">
          <h4>Performance</h4>
          <p>Pixel Ratio: {window.devicePixelRatio}</p>
          <p>Canvas Size: {window.innerWidth}x{window.innerHeight}</p>
          <p>Memory: {(navigator as any).deviceMemory || 'Unknown'} GB</p>
        </div>
        
        <div className="debug-section">
          <h4>Console Logs</h4>
          <div className="console-logs">
            {consoleLogs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
