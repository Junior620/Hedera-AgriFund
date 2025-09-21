uniform float uTime;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform float uIntensity;
uniform vec2 uResolution;
uniform bool uReducedMotion;

varying vec2 vUv;
varying vec3 vPosition;

// Include noise functions
float snoise(vec3 v);
float fbm4(vec3 p);
vec3 hsv2rgb(vec3 c);

void main() {
  vec2 uv = vUv;

  // Create flowing gradient using FBM noise
  float timeScale = uReducedMotion ? 0.0 : uTime * 0.1;

  // Multiple noise layers for complex gradient flow
  vec3 noisePos = vec3(uv * 2.0, timeScale);
  float noise1 = fbm4(noisePos);
  float noise2 = fbm4(noisePos * 1.5 + vec3(100.0));

  // Create flowing movement
  vec2 flowDirection = vec2(
    noise1 * 0.3 + sin(timeScale * 0.5) * 0.2,
    noise2 * 0.2 + cos(timeScale * 0.3) * 0.15
  );

  vec2 flowUv = uv + flowDirection * 0.1;

  // Base gradient from bottom-left to top-right (Hedera brand direction)
  float gradientBase = dot(normalize(flowUv - 0.5), normalize(vec2(1.0, 1.0))) * 0.5 + 0.5;

  // Add noise variation
  float noiseInfluence = noise1 * 0.3 + noise2 * 0.2;
  float finalGradient = mix(gradientBase, noiseInfluence, 0.4);

  // Create color mixing
  vec3 baseColor = mix(uPrimaryColor, uSecondaryColor, finalGradient);

  // Add subtle highlights with HSV manipulation
  float hueShift = noise1 * 0.1;
  vec3 hsv = vec3(0.65 + hueShift, 0.3, 0.8); // Blue-ish base
  vec3 highlight = hsv2rgb(hsv);

  // Blend base color with highlights
  vec3 finalColor = mix(baseColor, highlight, smoothstep(0.3, 0.8, finalGradient) * 0.3);

  // Apply intensity and ensure it's not too bright
  finalColor *= uIntensity;
  finalColor = clamp(finalColor, 0.0, 1.0);

  // Add subtle vignette
  float vignette = 1.0 - length(uv - 0.5) * 0.8;
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 1.0);
}
