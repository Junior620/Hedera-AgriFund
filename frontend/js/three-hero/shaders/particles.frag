uniform float uTime;
uniform vec3 uParticleColor;
uniform float uIntensity;

varying float vActivity;
varying vec2 vUv;
varying float vDistance;

void main() {
  // Create soft circular particle
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Soft edge with smoothstep
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Add glow based on activity
  float glow = vActivity * 0.5 + 0.3;
  alpha *= glow;

  // Mouse proximity enhancement
  float mouseEffect = smoothstep(2.0, 0.5, vDistance);
  alpha += mouseEffect * 0.3;

  // Color based on activity with slight hue variation
  vec3 color = uParticleColor;
  color = mix(color, color * 1.5, vActivity);

  // Add slight blue tint for Hedera branding
  color = mix(color, vec3(0.2, 0.4, 0.9), 0.2);

  // Apply intensity
  color *= uIntensity;

  gl_FragColor = vec4(color, alpha);
}
