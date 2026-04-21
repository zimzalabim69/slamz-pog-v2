/**
 * Mobile Logger
 * Sends detailed debug information to console for mobile troubleshooting
 */

export const mobileLogger = {
  log: (message: string, data?: any) => {
    console.log(`[MOBILE] ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[MOBILE ERROR] ${message}`, error);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[MOBILE WARN] ${message}`, data);
  },
  
  debug: (message: string, data?: any) => {
    console.debug(`[MOBILE DEBUG] ${message}`, data);
  }
};

export const logDeviceInfo = () => {
  const info = {
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    touchSupport: 'ontouchstart' in window,
    webglSupport: checkWebGLSupport(),
    memory: (navigator as any).deviceMemory,
    cores: navigator.hardwareConcurrency,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  mobileLogger.log('Device Info', info);
  return info;
};

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

export const logComponentMount = (componentName: string) => {
  mobileLogger.log(`Component mounted: ${componentName}`);
};

export const logComponentError = (componentName: string, error: Error) => {
  mobileLogger.error(`Component error in ${componentName}`, {
    message: error.message,
    stack: error.stack,
    component: componentName
  });
};

export const logRenderCycle = (componentName: string, phase: 'mount' | 'update' | 'unmount') => {
  mobileLogger.debug(`Render cycle: ${componentName} - ${phase}`);
};
