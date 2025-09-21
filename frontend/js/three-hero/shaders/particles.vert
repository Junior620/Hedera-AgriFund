uniform float uTime;
uniform vec2 uMouse;
uniform float uScale;
uniform bool uReducedMotion;

attribute vec3 instancePosition;
attribute float instanceActivity;
attribute float instancePhase;

varying float vActivity;
varying vec2 vUv;
varying float vDistance;

void main() {
  vUv = uv;
  vActivity = instanceActivity;

  // Base position from instance
  vec3 pos = position * uScale;

  // Add breathing animation
  float timeScale = uReducedMotion ? 0.0 : uTime;
  float breathe = sin(timeScale * 0.5 + instancePhase) * 0.1;
  pos *= (1.0 + breathe);

  // Mouse repulsion effect
  vec3 worldPos = instancePosition + pos;
  vec2 mouseWorld = uMouse * 10.0 - 5.0; // Convert NDC to world space
  float mouseDistance = distance(worldPos.xy, mouseWorld);

  if (mouseDistance < 2.0) {
    vec2 repulsion = normalize(worldPos.xy - mouseWorld) * (2.0 - mouseDistance) * 0.3;
    worldPos.xy += repulsion;
  }

  vDistance = mouseDistance;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
