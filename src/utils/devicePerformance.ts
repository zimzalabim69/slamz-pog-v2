/**
 * Device Performance Heuristic
 * --------------------------------------------------------------
 * WebGL antialias and DPR must be decided at Canvas creation time
 * and cannot be toggled afterwards. These constants are evaluated
 * once at module load and shared by every <Canvas> in the app.
 *
 * Strategy:
 *   - Cap DPR at 1.5 universally (fill-rate win on high-DPI screens)
 *   - Enable antialias only on desktop non-Retina where it matters
 *     most and where fill-rate cost is affordable. Mobile and
 *     high-DPR devices rely on oversampling + DPR cap instead.
 */

export const IS_MOBILE =
  typeof navigator !== 'undefined' &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const DEVICE_DPR =
  typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const ENABLE_ANTIALIAS = !IS_MOBILE && DEVICE_DPR < 2;

export const CANVAS_DPR: [number, number] = [1, 1.5];