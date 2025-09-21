uniform float uTime;
uniform vec3 uLinkColor;
uniform float uIntensity;

varying vec2 vUv;
varying float vPulse;
varying float vLength;

void main() {
  // Create flowing dashed effect along the link
  float dashPattern = sin(vUv.x * 20.0 - uTime * 2.0) * 0.5 + 0.5;

  // Pulse effect that travels along the link
  float pulsePos = mod(uTime * 0.5 + vPulse, 1.0);
  float pulseEffect = smoothstep(0.1, 0.0, abs(vUv.x - pulsePos)) * 2.0;

  // Base alpha with dashing
  float alpha = dashPattern * 0.3 + pulseEffect;

  // Fade out at ends
  alpha *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);

  // Color with pulse highlighting
  vec3 color = uLinkColor;
  color = mix(color, color * 2.0, pulseEffect * 0.5);

  // Apply intensity
  color *= uIntensity;

  gl_FragColor = vec4(color, alpha);
}
