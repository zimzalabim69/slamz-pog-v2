import type { LogType } from '../store/useTerminalStore';
import { useTerminalStore } from '../store/useTerminalStore';

/**
 * System Logger Utility
 * Proxies standard console calls to the Slamz OS terminal store
 */

let isInitialized = false;
let isProxying = false;
let startupTime = Date.now();
const STARTUP_QUIET_PERIOD = 1000; // 1 second ignore window

export const initSystemLogger = () => {
  if (isInitialized) return;

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  const addLog = (type: LogType, args: any[]) => {
    // 1. Re-entrancy Guard
    if (isProxying) return;
    
    // 2. Startup Quiet Period (Ignore Vite/HMR chatter for the first second)
    if (Date.now() - startupTime < STARTUP_QUIET_PERIOD) return;
    
    isProxying = true;
    try {
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return '[Object]';
            }
          }
          return String(arg);
        })
        .join(' ');
        
      const store = useTerminalStore.getState();
      if (store && store.addLog) {
        store.addLog(type, message);
      }
    } catch (e) {
      originalError('[LOGGER CRASH]', e);
    } finally {
      isProxying = false;
    }
  };

  console.log = (...args: any[]) => {
    originalLog(...args);
    addLog('info', args);
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    addLog('warn', args);
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    addLog('error', args);
  };

  console.info = (...args: any[]) => {
    originalInfo(...args);
    addLog('info', args);
  };

  isInitialized = true;
  originalLog('[SYSTEM] Slamz Console Bridge Active.');
};

export const systemLog = (message: string) => {
  useTerminalStore.getState().addLog('system', message);
};
