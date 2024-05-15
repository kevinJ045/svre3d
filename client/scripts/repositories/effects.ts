import { RenderPass, Scene3D, ShaderPass, THREE } from "enable3d";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { UnrealBloomPass } from "../lib/UnrealBloomPass.ts";
import { RenderPixelatedPass } from "../lib/RenderPixelatedPass.ts";
import { MainScene } from "../scene/scene.ts";
import { Settings } from "../settings/settings.ts";



export default class EffectManager {

  static init(scene: MainScene){
    let r = new RenderPass(scene.scene, scene.camera);
		scene.composer.addPass(r);
    this.bloom(scene);
    this.ssaoPass(scene);
    this.pixel(scene);
    this.fxaa(scene);
  }

  static ssaoPass(scene: MainScene){
    const ssaoPass = new SSAOPass(scene.scene, scene.camera, scene.renderer.getSize(new THREE.Vector2()).x, scene.renderer.getSize(new THREE.Vector2()).y);
		ssaoPass.kernelRadius = 16;
		ssaoPass.minDistance = 0.02;
		ssaoPass.maxDistance = Infinity;
    EffectManager.passUpdate(scene, ssaoPass, 'ssao');
  }

  static bloom(scene: MainScene){
    const pass = new UnrealBloomPass( scene.renderer.getSize(new THREE.Vector2()), 1, 0.5, 0.4) as any;
    EffectManager.passUpdate(scene, pass, 'enableBloom');
  }

  static pixel(scene: MainScene){
    const pass = new RenderPixelatedPass(Settings.get('pixelLevel', 2), scene.scene, scene.camera) as any;
    EffectManager.passUpdate(scene, pass, 'enablePixels', [
      ['pixelLevel', 'pixelSize']
    ]);
  }

  static fxaa(scene: MainScene){
    
    const pass = new ShaderPass(FXAAShader);
    // EffectManager.passUpdate(scene, pass, 'enablePixels', [
    //   ['pixelLevel', 'pixelSize']
    // ]);
    pass.uniforms["resolution"].value.set(
      1 / scene.renderer.domElement.width,
      1 / scene.renderer.domElement.height
    );
    pass.renderToScreen = true;
    scene.composer.addPass(pass);
  }

  static passUpdate(scene: MainScene, pass: any, key: string, keymap?: string[][]){
    if(Settings.get(key)) {
      scene.composer.addPass(pass);
      (pass as any).added = true;
    }
    Settings.on('change:'+key, () => {
      if(Settings.get(key) == true){
        if((pass as any).added) return;
        scene.composer.addPass(pass);
        console.log('add');
        (pass as any).added = true;
      } else {
        scene.composer.removePass(pass);
        console.log('remove');
        (pass as any).added = false;
      }
    });

    if(keymap){
      keymap.forEach(([settingKey, setPassOptionKey]) => {
        Settings.on(settingKey, () => {
          pass.setPassOptionKey = Settings.get(setPassOptionKey);
        });
      });
    }
  }

  static resize(scene: MainScene){
		if(scene.ssaoPass) scene.ssaoPass.setSize(window.innerWidth, window.innerHeight);
		if(scene.unrealBloomPass) scene.unrealBloomPass.setSize(window.innerWidth, window.innerHeight);
  }

  static update(scene: MainScene){}

}