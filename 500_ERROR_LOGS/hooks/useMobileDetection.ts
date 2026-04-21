/**
 * Mobile Detection Hook (V2 - Stable)
 * Optimized to prevent the 'Resize Cascade' by only triggering
 * updates on meaningful category or orientation changes.
 */

import { useState, useEffect, useRef } from 'react';

export interface MobileInfo {
  isMobile: boolean;
  isTouch: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useMobileDetection = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>(() => ({
    isMobile: false,
    isTouch: false,
    isTablet: false,
    orientation: 'landscape',
  }));

  const lastProcessed = useRef<MobileInfo>(mobileInfo);

  useEffect(() => {
    let timeoutId: number | null = null;

    const detectMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isTabletDevice = /iPad|Android/i.test(userAgent) && window.innerWidth > 768;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      const nextInfo: MobileInfo = {
        isMobile: isMobileDevice || isTouchDevice,
        isTouch: isTouchDevice,
        isTablet: isTabletDevice,
        orientation,
      };

      // DEEP COMPARISON: Only update state if categories or orientation change.
      // We ignore screenWidth/screenHeight pixel changes to prevent re-render loops.
      const hasChanged = 
        nextInfo.isMobile !== lastProcessed.current.isMobile ||
        nextInfo.isTouch !== lastProcessed.current.isTouch ||
        nextInfo.isTablet !== lastProcessed.current.isTablet ||
        nextInfo.orientation !== lastProcessed.current.orientation;

      if (hasChanged) {
        lastProcessed.current = nextInfo;
        setMobileInfo(nextInfo);
        console.log('[SYSTEM] Mobile Category/Orientation Change Detected:', nextInfo);
      }
    };

    const debouncedDetect = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      // Wait for 250ms of stability before checking for meaningful changes
      timeoutId = window.setTimeout(detectMobile, 250);
    };

    detectMobile();
    
    window.addEventListener('resize', debouncedDetect);
    window.addEventListener('orientationchange', detectMobile); // Orientation change is usually high priority

    return () => {
      window.removeEventListener('resize', debouncedDetect);
      window.removeEventListener('orientationchange', detectMobile);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return mobileInfo;
};
