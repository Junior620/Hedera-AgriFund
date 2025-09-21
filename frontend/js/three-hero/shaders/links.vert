uniform float uTime;
uniform bool uReducedMotion;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;
attribute float instancePulse;

varying vec2 vUv;
varying float vPulse;
varying float vLength;

void main() {
  vUv = uv;
  vPulse = instancePulse;

  // Calculate link direction and length
  vec3 direction = instanceEnd - instanceStart;
  vLength = length(direction);
  direction = normalize(direction);

  // Position along the link
  vec3 linkPos = mix(instanceStart, instanceEnd, position.x);

  // Add slight curve for organic feel
  float timeScale = uReducedMotion ? 0.0 : uTime;
  float curve = sin(position.x * 3.14159) * 0.1;
  vec3 perpendicular = normalize(cross(direction, vec3(0.0, 0.0, 1.0)));
  linkPos += perpendicular * curve;

  // Width variation
  linkPos += perpendicular * position.y * 0.02;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(linkPos, 1.0);
}
