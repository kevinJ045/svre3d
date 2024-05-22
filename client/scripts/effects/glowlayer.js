import { EffectComposer, RenderPass, THREE } from "enable3d";
import { UnrealBloomPass } from "../lib/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
export class GlowLayer extends EffectComposer {
    constructor(renderer, scene, camera) {
        const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            colorSpace: THREE.SRGBColorSpace,
            samples: 4
        });
        super(renderer, target);
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.0, 1.01);
        const outputPass = new OutputPass();
        this.addPass(renderScene);
        this.addPass(bloomPass);
        this.addPass(outputPass);
    }
}
