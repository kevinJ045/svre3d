import { RenderPass, Scene3D, ShaderPass, THREE } from "enable3d";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { UnrealBloomPass } from "../lib/UnrealBloomPass.js";
import { RenderPixelatedPass } from "../lib/RenderPixelatedPass.js";
import { MainScene } from "../scene/scene.js";
import { Settings } from "../settings/settings.js";
import { GlowLayer } from "../effects/glowlayer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { WorldData } from "../world/data.js";



export default class EffectManager {

  static init(scene: MainScene) {
    let r = new RenderPass(scene.scene, scene.camera);
    scene.composer.addPass(r);
    this.ssaoPass(scene);
    this.pixel(scene);
    this.fxaa(scene);
    this.bloom(scene);
    scene.composer.addPass(new OutputPass());
  }

  static ssaoPass(scene: MainScene) {
    const ssaoPass = new SSAOPass(scene.scene, scene.camera, scene.renderer.getSize(new THREE.Vector2()).x, scene.renderer.getSize(new THREE.Vector2()).y);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.02;
    ssaoPass.maxDistance = Infinity;
    EffectManager.passUpdate(scene, ssaoPass, 'ssao');
  }

  static fog_getFar(){
    return (Settings.get<number>('performance.renderDistance') * 2) * WorldData.get('chunkSize');
  }

  static fog_color = 0xcccccc;
  static fog_getColor(){
    return new THREE.Color(this.fog_color);
  }

  static initFog(scene: MainScene, distance = 0){
		const fog = new THREE.Fog(this.fog_getColor(), distance || 1, this.fog_getFar() + distance);
    const add_fog = () => {
      if (Settings.get('graphics.fog') == true) {
        scene.scene.fog = fog;
      } else {
        scene.scene.fog = null;
      }
    };
    Settings.on('change:fog', add_fog);
    add_fog();
  }

  static fog_update(scene: MainScene, distance: number){
    // console.log(this.fog_getColor());
    if(scene.scene.fog){
      (scene.scene.fog as THREE.Fog).color = this.fog_getColor();
      (scene.scene.fog as THREE.Fog).near = distance;
      (scene.scene.fog as THREE.Fog).far = this.fog_getFar() + distance;
    }
  }

  static bloom(scene: MainScene) {
    // const pass = new GlowLayer( scene.renderer, scene.scene, scene.camera) as any;
    // scene.composer2 = pass;
    // pass.render();
    const pass = new UnrealBloomPass(new THREE.Vector2(scene.renderer.domElement.width, scene.renderer.domElement.height), 0.2, 0.0, 1.01);
    EffectManager.passUpdate(scene, pass, 'enableBloom');
  }

  static pixel(scene: MainScene) {
    const pass = new RenderPixelatedPass(Settings.get('graphics.pixelLevel', 2), scene.scene, scene.camera) as any;
    EffectManager.passUpdate(scene, pass, 'enablePixels', [
      ['pixelLevel', 'pixelSize']
    ]);
  }

  static fxaa(scene: MainScene) {

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

  static passUpdate(scene: MainScene, pass: any, key: string, keymap?: string[][]) {
    if (Settings.get('graphics.'+key)) {
      scene.composer.addPass(pass);
      (pass as any).added = true;
    }
    Settings.on('change:graphics.' + key, () => {
      if (Settings.get('graphics.'+key) == true) {
        if ((pass as any).added) return;
        scene.composer.addPass(pass);
        console.log('add');
        (pass as any).added = true;
      } else {
        scene.composer.removePass(pass);
        console.log('remove');
        (pass as any).added = false;
      }
    });

    if (keymap) {
      keymap.forEach(([settingKey, setPassOptionKey]) => {
        Settings.on('change:graphics.'+settingKey, () => {
          pass[setPassOptionKey] = Settings.get('graphics.'+settingKey);
        });
      });
    }
  }

  static resize(scene: MainScene) {
    if (scene.ssaoPass) scene.ssaoPass.setSize(window.innerWidth, window.innerHeight);
    if (scene.unrealBloomPass) scene.unrealBloomPass.setSize(window.innerWidth, window.innerHeight);
  }

  static update(scene: MainScene) { }

}
