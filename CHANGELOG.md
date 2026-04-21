# SLAMZ PRO-TOUR V2 - Changelog

## [2026-04-13] - Mobile Compatibility Release

### **CRITICAL FIXES**
- **React Hooks Crisis Resolved**: Fixed "Rendered more hooks than during the previous render" error
- **Mobile Black Screen Fixed**: Game now renders properly on mobile devices
- **Conditional Component Rendering**: Implemented separate DesktopControls/MobileControls components

### **MOBILE FEATURES ADDED**
- **Virtual Joystick**: Thumb-controlled movement for mobile gameplay
- **SLAM Button**: Touch-activated slammer control
- **Touch Gesture Support**: Single touch for aiming, double tap for special actions
- **Mobile Camera Controller**: Automatic aspect ratio adjustment for mobile devices
- **Performance Optimization**: Mobile-specific settings for FPS and rendering quality

### **ARCHITECTURE CHANGES**
- **Component Separation**: Split controls into separate components to prevent hook conflicts
  - `DesktopControls.tsx` - Keyboard/mouse controls (1 hook)
  - `MobileControls.tsx` - Touch controls (8 hooks, stable count)
- **Conditional Rendering**: `{isMobile ? <MobileControls /> : <DesktopControls />}`
- **Vite Configuration**: Added `base: './'` for mobile network asset loading

### **DEBUG TOOLS ADDED**
- **Mobile Debug Panel**: Real-time device info, WebGL status, console logs
- **Remote Logger**: Centralized logging system for mobile troubleshooting
- **Error Boundary**: React error catching with detailed mobile logging
- **Fallback UI**: Graceful degradation when WebGL fails

### **BUG FIXES**
- **Canvas Positioning**: Fixed mobile canvas dimensions (100vw/100vh, position: fixed)
- **Z-Index Layering**: Proper UI layering (Debug: 99999, Controls: 99998, Canvas: 1)
- **Touch Events**: Added proper touch event handling with preventDefault
- **Asset Loading**: Fixed network asset resolution for mobile devices

### **DEVELOPER EXPERIENCE**
- **Clear Storage Tool**: `/clear-storage.html` for debugging cache issues
- **Debug Logs Viewer**: `/debug-logs.html` for mobile log inspection
- **Enhanced Logging**: Comprehensive error capture and device information

### **TECHNICAL DETAILS**
- **React Hooks Compliance**: All hooks now follow Rules of Hooks
- **Network Configuration**: Proper host binding and HMR for mobile development
- **WebGL Context Monitoring**: Context loss/restoration event handling
- **Performance Monitoring**: Mobile-specific FPS and memory tracking

## [2026-04-13] - Documentation Overhaul "Indestructible"
- **Unified Standards**: Consolidated React Hook hygiene rules into `DEVELOPER_GUIDE.md`.
- **Physics Registry**: Documented all "Magic Numbers" (Gravity: -16, Slam: -22) for future tuning.
- **Asset Pipeline**: Added 3-step tutorial for procedural SLAMZ set generation.
- **Submission Checklist**: Added Vibejam 2026 pre-flight checklist.
- **Crisis Archive**: Moved historical "React Hooks Crisis" details to `PORT_DOCUMENTATION.md`.

## **Network Access**
- **Desktop**: `http://localhost:5173/`
- **Mobile**: `http://192.168.0.201:5173/`
- **Debug Tools**: `/debug-logs.html`, `/clear-storage.html`

---

**Status**: Mobile and desktop versions fully functional with cross-platform compatibility achieved.
