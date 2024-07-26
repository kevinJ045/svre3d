uniform sampler2D map;
uniform float ratioR;
uniform float ratioG;
uniform float ratioB;
uniform float gamma;
varying vec2 vUv;
void main(void) {
  vec4 tex = texture2D(map, vUv);
  // using RGB channels of the texture de vary the lighting
  float col = tex.r * ratioR + tex.g * ratioG + tex.b * ratioB;
  // adjust contrast
  col = pow(col, gamma);
  gl_FragColor = linearToOutputTexel(vec4(col, col, col, 1.));
}