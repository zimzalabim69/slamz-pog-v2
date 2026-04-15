export const NoirShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'uDesaturation': { value: 0.0 },
    'uContrast': { value: 1.15 },
    'uVignette': { value: 0.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uDesaturation;
    uniform float uContrast;
    uniform float uVignette;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      float gray = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 grayscale = vec3(gray);
      vec3 finalColor = mix(color.rgb, grayscale, uDesaturation);
      finalColor = (finalColor - 0.5) * uContrast + 0.5;
      
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vignetteMask = smoothstep(0.8, 0.4, dist);
      finalColor *= mix(1.0, vignetteMask, uVignette);

      gl_FragColor = vec4(finalColor, color.a);
    }
  `
};
