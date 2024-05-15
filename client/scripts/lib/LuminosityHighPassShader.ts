// @ts-nocheck
import {
	Color
} from 'three';

/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

const LuminosityHighPassShader = {

	name: 'LuminosityHighPassShader',

	shaderID: 'luminosityHighPass',

	uniforms: {

		'tDiffuse': { value: null },
		'luminosityThreshold': { value: 1.0 },
		'smoothWidth': { value: 1.0 },
		'defaultColor': { value: new Color( 0x000000 ) },
		'defaultOpacity': { value: 0.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

	uniform sampler2D tDiffuse;
	uniform vec3 defaultColor;
	uniform float defaultOpacity;
	uniform float luminosityThreshold;
	uniform float smoothWidth;
	
	varying vec2 vUv;
	
	void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
	
			// Extract emissive color from the texture
			vec3 emissiveColor = texel.rgb;
	
			// Calculate the luminosity of the pixel
			float luminosity = dot(emissiveColor, vec3(0.299, 0.587, 0.114));
	
			// Output color and opacity for non-emissive pixels
			vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);
	
			// If the luminosity exceeds the threshold, include the pixel in the bloom effect
			float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, luminosity);
	
			// Mix the output color with the original pixel color based on alpha
			gl_FragColor = mix(outputColor, texel, alpha);
	}
	`

};

export { LuminosityHighPassShader };