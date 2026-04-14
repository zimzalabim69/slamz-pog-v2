/**
 * Fallback UI
 * Shows when WebGL fails or app doesn't load properly
 */

import { useEffect, useState } from 'react';
import './FallbackUI.css';

export const FallbackUI = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show fallback if nothing renders after 3 seconds
    const timer = setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas || canvas.width === 0) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fallback-ui">
      <div className="fallback-content">
        <h1>SLAMZ PRO-TOUR</h1>
        <div className="error-message">
          <h2>WebGL Loading Issue</h2>
          <p>Your browser may not support WebGL or there's a loading problem.</p>
        </div>
        
        <div className="troubleshooting">
          <h3>Troubleshooting Steps:</h3>
          <ol>
            <li>Try refreshing the page</li>
            <li>Update your browser to the latest version</li>
            <li>Try Chrome, Firefox, or Safari</li>
            <li>Enable WebGL in browser settings</li>
            <li>Clear browser cache and cookies</li>
          </ol>
        </div>

        <div className="actions">
          <button onClick={() => window.location.reload()} className="primary-button">
            Reload Page
          </button>
          <button onClick={() => {
            // Try to force WebGL context
            const testCanvas = document.createElement('canvas');
            const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (gl) {
              alert('WebGL is available but failed to initialize. Try reloading.');
            } else {
              alert('WebGL is not supported on this device/browser.');
            }
          }} className="secondary-button">
            Test WebGL
          </button>
        </div>

        <div className="device-info">
          <h4>Device Information:</h4>
          <p>Browser: {navigator.userAgent.substring(0, 50)}...</p>
          <p>Screen: {window.innerWidth}x{window.innerHeight}</p>
          <p>Touch Support: {'ontouchstart' in window ? 'Yes' : 'No'}</p>
          <p>Mobile: {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};
