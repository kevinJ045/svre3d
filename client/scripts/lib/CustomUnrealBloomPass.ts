// @ts-nocheck
import {THREE} from 'enable3d';
import { Pass } from './Pass.ts';


const UnrealBloomShader = {

    uniforms: {
        'tDiffuse': { value: null },
        'tBloom': { value: null },
        'threshold': { value: 0.5 }, // Adjust the threshold value as needed
        'strength': { value: 1.0 },
        'radius': { value: 0.0 },
        'resolution': { value: new THREE.Vector2(1, 1) }
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
        uniform sampler2D tBloom;
        uniform float threshold;
        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec4 bloom = texture2D(tBloom, vUv);

            // Calculate luminance from emissive color
            float luminance = max(color.rgb, vec3(0.)).r; // Assuming the emissive color is stored in the red channel

            // Apply threshold to emissive luminance
            float bloomThreshold = max(luminance - threshold, 0.);

            // Add bloomed emissive color to the original color
            gl_FragColor = color + bloomThreshold * bloom;
        }
    `
};

export class CustomUnrealBloomPass extends Pass {
    constructor(resolution, strength, radius, threshold) {
        super();

        this.strength = (strength !== undefined) ? strength : 1;
        this.radius = (radius !== undefined) ? radius : 0;
        this.threshold = (threshold !== undefined) ? threshold : 0.5;

        this.resolution = (resolution !== undefined) ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);

        // Render targets
        const pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.renderTargetsHorizontal = [];
        this.renderTargetsVertical = [];
        this.nMips = 5;
        let resx = Math.round(this.resolution.x / 2);
        let resy = Math.round(this.resolution.y / 2);

        this.renderTargetBright = new THREE.WebGLRenderTarget(resx, resy, pars);
        this.renderTargetBright.texture.name = 'CustomUnrealBloomPass.bright';
        this.renderTargetBright.texture.generateMipmaps = false;

        for (let i = 0; i < this.nMips; i++) {
            const renderTarget = new THREE.WebGLRenderTarget(resx, resy, pars);
            renderTarget.texture.name = 'CustomUnrealBloomPass.h' + i;
            renderTarget.texture.generateMipmaps = false;
            this.renderTargetsHorizontal.push(renderTarget);

            const renderTargetVertical = new THREE.WebGLRenderTarget(resx, resy, pars);
            renderTargetVertical.texture.name = 'CustomUnrealBloomPass.v' + i;
            renderTargetVertical.texture.generateMipmaps = false;
            this.renderTargetsVertical.push(renderTargetVertical);

            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }

        // Shader uniforms
        this.uniforms = THREE.UniformsUtils.clone(UnrealBloomShader.uniforms);
        this.uniforms['tDiffuse'].value = this.renderTargetBright.texture;
        this.uniforms['tBloom'].value = this.renderTargetsVertical[0].texture;
        this.uniforms['threshold'].value = this.threshold;
        this.uniforms['strength'].value = this.strength;
        this.uniforms['radius'].value = this.radius;

        // Shader passes
        this.brightPassShader = CustomUnrealBloomPass.getBrightPassShader();
        this.brightPassUniforms = THREE.UniformsUtils.clone(this.brightPassShader.uniforms);
        this.brightPassUniforms['minLuminance'].value = 0.0;

        this.brightPassMaterial = new THREE.ShaderMaterial({
            uniforms: this.brightPassUniforms,
            vertexShader: this.brightPassShader.vertexShader,
            fragmentShader: this.brightPassShader.fragmentShader,
            defines: {}
        });

        this.blurPassShader = CustomUnrealBloomPass.getBlurPassShader();
        this.blurPassUniforms = THREE.UniformsUtils.clone(this.blurPassShader.uniforms);
        this.blurPassMaterial = new THREE.ShaderMaterial({
            uniforms: this.blurPassUniforms,
            vertexShader: this.blurPassShader.vertexShader,
            fragmentShader: this.blurPassShader.fragmentShader,
            defines: {}
        });

        this.compositeMaterial = this.getCompositeMaterial(this.nMips);
        this.compositeUniforms = this.compositeMaterial.uniforms;

        this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
        this.scene = new THREE.Scene();
        this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
        this.scene.add(this.quad);
    }

    dispose() {
        for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
            this.renderTargetsHorizontal[i].dispose();
        }

        for (let i = 0; i < this.renderTargetsVertical.length; i++) {
            this.renderTargetsVertical[i].dispose();
        }

        this.renderTargetBright.dispose();
    }

    setSize(width, height) {
        this.renderTargetBright.setSize(width, height);

        let resx = Math.round(width / 2);
        let resy = Math.round(height / 2);

        for (let i = 0; i < this.nMips; i++) {
            this.renderTargetsHorizontal[i].setSize(resx, resy);
            this.renderTargetsVertical[i].setSize(resx, resy);

            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        // Bright pass
        this.quad.material = this.brightPassMaterial;
        this.brightPassUniforms['tDiffuse'].value = readBuffer.texture;
        this.brightPassUniforms['minLuminance'].value = this.threshold;
        renderer.setRenderTarget(this.renderTargetBright);
        renderer.clear();
        renderer.render(this.scene, this.camera);

        // Blur pass
        let inputRenderTarget = this.renderTargetBright;
        for (let i = 0; i < this.nMips; i++) {
            this.quad.material = this.blurPassMaterial;
            this.blurPassUniforms['tDiffuse'].value = inputRenderTarget.texture;
            this.blurPassUniforms['resolution'].value.set(inputRenderTarget.width, inputRenderTarget.height);
            this.blurPassUniforms['radius'].value = this.radius;
            renderer.setRenderTarget(this            .renderTargetsHorizontal[i]);
            renderer.clear();
            renderer.render(this.scene, this.camera);

            this.quad.material = this.blurPassMaterial;
            this.blurPassUniforms['tDiffuse'].value = this.renderTargetsHorizontal[i].texture;
            this.blurPassUniforms['resolution'].value.set(this.renderTargetsHorizontal[i].width, this.renderTargetsHorizontal[i].height);
            renderer.setRenderTarget(this.renderTargetsVertical[i]);
            renderer.clear();
            renderer.render(this.scene, this.camera);

            inputRenderTarget = this.renderTargetsVertical[i];
        }

        // Composite pass
        this.quad.material = this.compositeMaterial;
        this.compositeUniforms['bloomStrength'].value = this.strength;
        this.compositeUniforms['bloomRadius'].value = 0.1; // Adjust as needed
        this.compositeUniforms['tDiffuse'].value = readBuffer.texture;
        this.compositeUniforms['tBloom'].value = inputRenderTarget.texture;

        if (maskActive) renderer.state.buffers.stencil.setTest(false);

        renderer.setRenderTarget(writeBuffer);
        renderer.clear();
        renderer.render(this.scene, this.camera);
    }

    static getBrightPassShader() {
        return {
            uniforms: {
                'tDiffuse': { value: null },
                'minLuminance': { value: 0.0 }
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
                uniform float minLuminance;
                varying vec2 vUv;

                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    float l = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
                    gl_FragColor = vec4(vec3(smoothstep(minLuminance, 1.0, l)), 1.0);
                }
            `
        };
    }

    static getBlurPassShader() {
        return {
            uniforms: {
                'tDiffuse': { value: null },
                'resolution': { value: new THREE.Vector2(1, 1) },
                'radius': { value: 0.0 }
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
                uniform vec2 resolution;
                uniform float radius;
                varying vec2 vUv;

                void main() {
                    vec4 sum = vec4(0.0);
                    for (int i = -4; i <= 4; i++) {
                        sum += texture2D(tDiffuse, vUv + float(i) * radius / resolution);
                    }
                    gl_FragColor = sum / 9.0; // Assuming a 9-sample kernel
                }
            `
        };
    }

    getCompositeMaterial(nMips) {
        return new THREE.ShaderMaterial({
            uniforms: {
                'tDiffuse': { value: null },
                'tBloom': { value: null },
                'bloomStrength': { value: 1.0 },
                'bloomRadius': { value: 0.1 },
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
                uniform sampler2D tBloom;
                uniform float bloomStrength;
                uniform float bloomRadius;
                varying vec2 vUv;

                void main() {
                    vec4 base = texture2D(tDiffuse, vUv);
                    vec4 bloom = texture2D(tBloom, vUv);
                    gl_FragColor = base + bloomStrength * bloom;
                }
            `,
            defines: {
                'NUM_MIPS': nMips
            },
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    }
}

export default CustomUnrealBloomPass;