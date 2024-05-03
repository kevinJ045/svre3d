uniform sampler2D textureMap;
varying vec2 vUv;

void main() {
		gl_FragColor = texture2D(textureMap, vUv);
}