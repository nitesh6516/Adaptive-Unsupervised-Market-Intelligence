// Reserved for production shader expansion. The live demo uses inline materials
// so the app can boot without a shader fetch waterfall.
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
