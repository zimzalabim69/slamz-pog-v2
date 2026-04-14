import * as React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Plane } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { physicsFogBridge } from '../../systems/PhysicsFogBridge';
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

  useThree(); // Ensure we are in an R3F context

  // Internal trackers
  const pulseVal = React.useRef(0);
  const lastPulseTrigger = React.useRef(fogPulseTrigger);

  // Shader Uniforms
  const uniforms = React.useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(fogColorStr) },
    uPulse: { value: 0 },
    uPhysicsEnergy: { value: 0 },
    uDistPos: { value: Array(5).fill(new THREE.Vector3()) },
    uDistEnergy: { value: new Float32Array(5) },
    uDistColor: { value: Array(5).fill(new THREE.Color()) },
    uIsShowcase: { value: 0 },
  }), []);

  // Sync state (Only on heavy state changes like color)
  React.useEffect(() => {
    uniforms.uColor.value.set(fogColorStr);
  }, [fogColorStr, uniforms]);

  React.useEffect(() => {
    if (fogPulseTrigger !== lastPulseTrigger.current) {
        pulseVal.current = 1.0;
        lastPulseTrigger.current = fogPulseTrigger;
    }
  }, [fogPulseTrigger]);

  useFrame((state) => {
    if (!materialRef.current) return;

    pulseVal.current = THREE.MathUtils.lerp(pulseVal.current, 0, 0.05);
    
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPulse.value = pulseVal.current;
    
    // READ FROM THE BRIDGE (Ref-based, 0 re-renders)
    uniforms.uPhysicsEnergy.value = THREE.MathUtils.lerp(uniforms.uPhysicsEnergy.value, physicsFogBridge.energy, 0.1);
    
    physicsFogBridge.disturbances.forEach((d, i) => {
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
    uniform float uPulse;
    uniform float uPhysicsEnergy;
    uniform vec3 uDistPos[5];
    uniform float uDistEnergy[5];
    uniform vec3 uDistColor[5];
    uniform float uIsShowcase;
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
      float mask = smoothstep(1.0, 8.0, distToOrigin);
      if (uIsShowcase > 0.5) mask = smoothstep(0.5, 4.0, distToOrigin);

      float turbulence = 0.4 + (uPhysicsEnergy * 0.1);
      float n = snoise(vWorldPos.xz * 0.2 + uTime * 0.1 * turbulence);
      
      float fogBase = 0.5 + 0.5 * n;
      float finalAlpha = fogBase * mask * 0.8;

      vec3 finalColor = uColor;
      float totalWake = 0.0;
      vec3 totalGlow = vec3(0.0);

      for(int i=0; i<5; i++) {
        float d = distance(vWorldPos, uDistPos[i]);
        float wakeRadius = 1.5 + uDistEnergy[i] * 0.5;
        float effect = smoothstep(wakeRadius, 0.0, d) * uDistEnergy[i];
        totalWake += effect * 0.6;
        if (length(uDistColor[i]) > 0.1) {
            totalGlow += uDistColor[i] * effect * 1.5;
        }
      }

      finalAlpha = clamp(finalAlpha - totalWake, 0.0, 1.0);
      finalColor += totalGlow;
      finalAlpha += uPulse * 0.3 * mask;
      finalColor += vec3(1.0, 1.0, 0.5) * uPulse * 0.3;

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[50, 16, 16]} />
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
      <Sparkles count={200} scale={[30, 15, 30]} size={4} speed={0.2} opacity={0.15} color="#ffffff" />
      <MistWisps />
    </>
  );
}

function MistWisps() {
  return (
    <group>
      {[...Array(3)].map((_, i) => (
        <MistWisp key={i} index={i} />
      ))}
    </group>
  );
}

function MistWisp({ index }: { index: number }) {
  const mesh = React.useRef<THREE.Mesh>(null);
  const startPos = React.useMemo(() => [(Math.random() - 0.5) * 20, Math.random() * 5, (Math.random() - 0.5) * 20], []);
  const uniforms = React.useMemo(() => ({ uOpacity: { value: 0.1 } }), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * 0.4;
    const turb = 1 + physicsFogBridge.energy * 0.2;
    
    mesh.current.position.x = startPos[0] + Math.sin(t + index) * 2 * turb;
    mesh.current.position.y = startPos[1] + (t % 10);
    mesh.current.position.z = startPos[2] + Math.cos(t + index) * 2 * turb;
    mesh.current.lookAt(state.camera.position);
    uniforms.uOpacity.value = 0.08 + Math.sin(t * 2) * 0.04;
  });

  return (
    <Plane ref={mesh} args={[8, 8]}>
      <shaderMaterial 
        transparent 
        depthWrite={false}
        blending={THREE.AdditiveBlending} 
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={`varying vec2 vUv; uniform float uOpacity; void main() { float d = distance(vUv, vec2(0.5)); float mask = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.0), mask * uOpacity); }`}
      />
    </Plane>
  );
}
