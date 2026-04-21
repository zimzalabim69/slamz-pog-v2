/**
 * Device Performance Heuristic (Desktop-Only)
 * --------------------------------------------------------------
 * WebGL antialias and DPR must be decided at Canvas creation time
 * and cannot be toggled afterwards. These constants are evaluated
 * once at module load and shared by every <Canvas> in the app.
 *
 * Strategy:
 *   - Cap DPR at 1.5 universally (fill-rate win on high-DPI screens)
 *   - Enable antialias on non-Retina displays for best sharpness
 */

export const DEVICE_DPR =
  typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const ENABLE_ANTIALIAS = DEVICE_DPR < 2;

export const CANVAS_DPR: [number, number] = [1, 1.5];
