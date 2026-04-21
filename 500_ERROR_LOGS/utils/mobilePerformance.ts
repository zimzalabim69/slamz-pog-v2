/**
 * Mobile Performance Utilities
 * Optimizes game performance for mobile devices
 */

export interface MobilePerformanceConfig {
  pixelRatio: number;
  shadowMapSize: number;
  antialias: boolean;
  maxLights: number;
  textureQuality: 'low' | 'medium' | 'high';
  physicsQuality: 'low' | 'medium' | 'high';
}

export const getMobilePerformanceConfig = (): MobilePerformanceConfig => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = isMobile && (
    navigator.hardwareConcurrency <= 4 || 
    /Android [1-5]/.test(navigator.userAgent) ||
    /iPhone [1-8]/.test(navigator.userAgent)
  );
  
  if (isLowEnd) {
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      shadowMapSize: 512,
      antialias: false,
      maxLights: 3,
      textureQuality: 'low',
      physicsQuality: 'low',
    };
  } else if (isMobile) {
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      shadowMapSize: 1024,
      antialias: true,
      maxLights: 5,
      textureQuality: 'medium',
      physicsQuality: 'medium',
    };
  } else {
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      shadowMapSize: 2048,
      antialias: true,
      maxLights: 8,
      textureQuality: 'high',
      physicsQuality: 'high',
    };
  }
};

export const optimizeForMobile = () => {
  const config = getMobilePerformanceConfig();
  
  // Set canvas pixel ratio through canvas style
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }
  
  // Disable unnecessary features on low-end devices
  if (config.textureQuality === 'low') {
    // Reduce texture quality
    document.body.style.imageRendering = 'crisp-edges';
  }
  
  return config;
};

export const monitorPerformance = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;
  
  const updateFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      
      // Auto-adjust quality if FPS drops too low
      if (fps < 30) {
        console.warn('Low FPS detected, consider reducing quality settings');
        return fps;
      }
    }
    
    requestAnimationFrame(updateFPS);
  };
  
  updateFPS();
  
  return {
    getFPS: () => fps,
    isLowPerformance: () => fps < 30,
  };
};

export const enableMobileOptimizations = () => {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Prevent scrolling
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  // Hide address bar on mobile
  if (window.scrollTo) {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
  }
  
  // Request landscape orientation
  if (screen.orientation && 'lock' in screen.orientation) {
    (screen.orientation as any).lock('landscape').catch(() => {
      // Ignore if orientation lock fails
    });
  }
};

export const getOptimalCameraSettings = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  return {
    fov: isMobile ? (aspectRatio < 1 ? 75 : 50) : 50,
    near: 0.1,
    far: isMobile ? 50 : 100,
    position: isMobile ? 
      (aspectRatio < 1 ? [0, 15, 8] : [0, 10, 6]) : 
      [0, 12, 5],
  };
};
