import * as React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { useGameStore } from '@100/store/useGameStore';
import { GAME_CONFIG } from '@100/constants/gameConfig';
import { physicsFogBridge } from '@400/systems/PhysicsFogBridge';
import * as THREE from 'three';

/**
 * LIVING ATMOSPHERE 13.4 (Stability Patch)
 * Uses a Ref-based Bridge for physics data to ensure zero React re-renders.
 */
export function AtmosphericFog() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<THREE.ShaderMaterial>(null);
  
  const fogColorStr = useGameStore((s) => s.fogColor);
  const fogPulseTrigger = useGameStore((state) => state.fogPulseTrigger);
  const gameState = useGameStore((state) => state.gameState);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const debugParams = useGameStore((state) => state.debugParams);

  useThree(); // Ensure we are in an R3F context

  // Internal trackers
  const pulseVal = React.useRef(0);
  const lastPulseTrigger = React.useRef(fogPulseTrigger);

  // Shader Uniforms
  const uniforms = React.useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color() },
    uDensity: { value: 0 },
    uPulse: { value: 0 },
    uPhysicsEnergy: { value: 0 },
    uDistPos: { value: Array(5).fill(new THREE.Vector3()) },
    uDistEnergy: { value: new Float32Array(5) },
    uDistColor: { value: Array(5).fill(new THREE.Color()) },
    uIsShowcase: { value: 0 },
    uPerfectHit: { value: 0 },
  }), []);

  // Sync color directly from debugParams
  React.useEffect(() => {
    const dp = useGameStore.getState().debugParams;
    uniforms.uColor.value.setRGB(dp.fogColorR, dp.fogColorG, dp.fogColorB);
  }, [debugParams.fogColorR, debugParams.fogColorG, debugParams.fogColorB, uniforms]);

  React.useEffect(() => {
    if (fogPulseTrigger !== lastPulseTrigger.current) {
        pulseVal.current = 1.0;
        lastPulseTrigger.current = fogPulseTrigger;
    }
  }, [fogPulseTrigger]);

  useFrame((state) => {
    if (!materialRef.current) return;

    const perfectHitActive = useGameStore.getState().perfectHitActive;
    
    pulseVal.current = THREE.MathUtils.lerp(pulseVal.current, 0, 0.08); // Sharper decay
    
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPulse.value = pulseVal.current;
    uniforms.uPerfectHit.value = perfectHitActive ? 1.0 : 0.0;
    uniforms.uDensity.value = GAME_CONFIG.FOG_DENSITY;
    
    // READ FROM THE BRIDGE (Ref-based, 0 re-renders)
    uniforms.uPhysicsEnergy.value = THREE.MathUtils.lerp(uniforms.uPhysicsEnergy.value, physicsFogBridge.energy, 0.1);
    
    physicsFogBridge.disturbances.forEach((d: any, i: number) => {
      uniforms.uDistPos.value[i].copy(d.pos);
      uniforms.uDistEnergy.value[i] = d.energy;
      uniforms.uDistColor.value[i].copy(d.color);
    });

    uniforms.uIsShowcase.value = gameState === 'SHOWCASE' ? 1.0 : 0.0;
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uDensity;
    uniform float uPulse;
    uniform float uPhysicsEnergy;
    uniform vec3 uDistPos[5];
    uniform float uDistEnergy[5];
    uniform vec3 uDistColor[5];
    uniform float uIsShowcase;
    uniform float uPerfectHit;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ; m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float distToOrigin = length(vWorldPos.xz);
      // BACKGROUND ONLY: Clear center area (up to 12 units)
      float mask = smoothstep(10.0, 25.0, distToOrigin);
      if (uIsShowcase > 0.5) mask = smoothstep(2.0, 8.0, distToOrigin);

      float turbulence = 0.4 + (uPhysicsEnergy * 0.1);
      float n = snoise(vWorldPos.xz * 0.2 + uTime * 0.1 * turbulence);
      
      float fogBase = 0.5 + 0.5 * n;
      // Connect density to the alpha scale
      float finalAlpha = fogBase * mask * uDensity * 20.0; 

      vec3 finalColor = uColor;
      float totalWake = 0.0;
      vec3 totalGlow = vec3(0.0);

      // Loop Unrolled to silence X3595 Gradient Instruction Warning
      {
        float d = distance(vWorldPos, uDistPos[0]);
        float wakeRadius = 1.5 + uDistEnergy[0] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[0];
        totalWake += effect * 0.6;
        if (length(uDistColor[0]) > 0.1) totalGlow += uDistColor[0] * effect * 1.5;
      }
      {
        float d = distance(vWorldPos, uDistPos[1]);
        float wakeRadius = 1.5 + uDistEnergy[1] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[1];
        totalWake += effect * 0.6;
        if (length(uDistColor[1]) > 0.1) totalGlow += uDistColor[1] * effect * 1.5;
      }
      {
        float d = distance(vWorldPos, uDistPos[2]);
        float wakeRadius = 1.5 + uDistEnergy[2] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[2];
        totalWake += effect * 0.6;
        if (length(uDistColor[2]) > 0.1) totalGlow += uDistColor[2] * effect * 1.5;
      }
      {
        float d = distance(vWorldPos, uDistPos[3]);
        float wakeRadius = 1.5 + uDistEnergy[3] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[3];
        totalWake += effect * 0.6;
        if (length(uDistColor[3]) > 0.1) totalGlow += uDistColor[3] * effect * 1.5;
      }
      {
        float d = distance(vWorldPos, uDistPos[4]);
        float wakeRadius = 1.5 + uDistEnergy[4] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[4];
        totalWake += effect * 0.6;
        if (length(uDistColor[4]) > 0.1) totalGlow += uDistColor[4] * effect * 1.5;
      }

      finalAlpha = clamp(finalAlpha - totalWake, 0.0, 1.0);
      finalColor += totalGlow;

      // IMPACT BLOOM
      vec3 bloomColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.8), uPerfectHit);
      finalAlpha += uPulse * 0.4 * mask;
      finalColor += bloomColor * uPulse * 0.5;

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  // Adaptive: skip fog entirely on low quality
  if (qualityLevel === 'low') {
    return null;
  }

  const sparkleCount = qualityLevel === 'medium' ? 30 : 80;

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[50, 12, 8]} />
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group position={[0, 0, 0]}>
        {/* Pushed sparkles out to background area only (min radius 15) */}
        <Sparkles count={sparkleCount} scale={[60, 25, 60]} size={6} speed={0.4} opacity={0.12} color="#ffffff" />
      </group>
    </>
  );
}

