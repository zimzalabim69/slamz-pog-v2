# SLAMZ STABILITY PROTOCOL (Production Hardening)

## 1. The "Zero-Fault" Rendering Rule
**CRITICAL**: The `postprocessing` library's `Bloom` pass and `KawaseBlur` are strictly prohibited on the current production target hardware. 
- **Symptom**: Triggered `WebGL Context Lost` followed by a recursive `JSON.stringify` circularity error.
- **Solution**: Use high `emissiveIntensity` (Value 6-10) on materials instead of a post-processing Bloom pass.

## 2. Logger Integrity
The `SystemLogger.ts` must never attempt to serialize complex objects.
- **Rule**: All `object` types passed to `console.log` must be converted to construction labels (e.g., `[Object ThreeScene]`) rather than using `JSON.stringify`.
- **Reason**: Prevents the JS thread from hanging during a GPU crash when trying to report circular scene-graph structures.

## 3. GPU Buffer Constraints
To ensure "Zero-Fault" booting:
- **Stencil Buffer**: Must be `false` in both `Canvas` and `EffectComposer`.
- **Multisampling**: Must be `0` in `EffectComposer`.
- **Power Preference**: Set to `default` in `App.tsx` gl parameters to prevent aggressive GPU switching.

## 4. Visual Fidelity Workarounds
To maintain the "AAAA" aesthetic without unstable passes:
- **Neon Lights**: Boost `emissiveIntensity` to `6.0` in `CyberAlley.tsx`.
- **Pog Glow**: Boost `emissiveIntensity` to `8.0` in `Slamz.tsx`.
- **Atmospheric Energy**: Use the `PhysicsFogBridge` to pulse material colors directly rather than using post-processing filters.
