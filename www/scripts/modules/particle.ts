import { TextGeometry } from "../lib/TextGeometry";
import { CustomScene } from "./models/scene";
import { THREE } from "enable3d";
import { basicVariables, parseVariable, setVector3Var } from "./variableMixer";
import { materialParser } from "./shaderMaterial";

export class Particle {
  velocity;
  lifetime;
  mesh;
  fullLifeTime;
	count;
	scatterAmount;

  constructor(mesh, velocity, lifetime, count = 1, scatter = null) {
    this.velocity = velocity;
    this.lifetime = lifetime;
    this.fullLifeTime = lifetime;
    this.mesh = mesh;
    this.count = count;
    this.scatterAmount = scatter;
  }

  animate() {
    if(Array.isArray(this.velocity)){
      const numSteps = this.velocity.length;
      const stepDuration = this.fullLifeTime / numSteps;

      let currentStep = 0;
      for (let i = 0; i < numSteps; i++) {
        const velocity = this.velocity[i];
        const velocityNext = this.velocity[i+1];
        const shouldBe = velocity.time ? (this.fullLifeTime*velocity.time/numSteps)/i : stepDuration/i;
        const shouldBeNext = velocityNext?.time ? (this.fullLifeTime*velocityNext.time/numSteps)/i : stepDuration/(i+1);

        if(
          this.lifetime <= shouldBe &&
          (velocityNext ? this.lifetime > shouldBeNext : true)
        ) currentStep = i;

      }
      const velocity = this.velocity[currentStep];

      this.mesh.position.add(velocity);
    } else {
      this.mesh.position.add(this.velocity);
    }

    if(this.lifetime < 10){
      if(this.mesh.material) {
        this.mesh.material.transparent = true;
        this.mesh.material.opacity -= 0.1;
      }
      if(this.mesh.children.length){
        this.mesh.traverse(child => {
          if(child.material){
            child.material.transparent = true;
            child.material.opacity -= 0.1;
          }
        });
      }
    }

    this.lifetime--;

  }

	scatter(){
		this.mesh.position.add(new THREE.Vector3(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		).normalize().multiplyScalar(this.scatterAmount));
	}

}


export class ParticleSystem {
  particleRegistry = {};

	scene: CustomScene;

	constructor(scene: CustomScene){
		this.scene = scene;
	}

	activeParticles: Particle[] = [];

  register(name, createParticleCallback) {
    this.particleRegistry[name] = createParticleCallback;
  }

  particle(name, pos, customData) {
    if (!this.particleRegistry[name]) {
      console.error(`Particle type '${name}' is not registered.`);
      return;
    }

    const createParticle = this.particleRegistry[name];
    const particle = createParticle(pos, customData);
		if(particle.count > 1) for(let i = 0; i < particle.count; i++) this.addParticle(particle.scatter());
		else this.addParticle(particle);
    return particle;
  }

  update() {
    for (const particle of this.activeParticles) {
      particle.animate();
      if (particle.lifetime <= 0) {
        // Remove particle if lifetime is over
        this.removeParticle(particle);
      }
    }
  }

  addParticle(particle) {
    this.activeParticles.push(particle);
		this.scene.scene.add(particle.mesh);
		console.log(particle);
  }

  removeParticle(particle) {
    const index = this.activeParticles.indexOf(particle);
    if (index !== -1) {
			this.scene.scene.remove(particle.mesh);
      this.activeParticles.splice(index, 1);
    }
  }

	registerFromJson(json){
		this.register(json.name, (pos, customData) => {
			let obj =  new THREE.Group();
			if(json.object){
				const o = this.scene.loadedObject(json.object.name)!.mesh!.clone();
				if(json.object.rotation) setVector3Var(o, 'rotation', json.object.rotation, customData);
				if(json.object.position) setVector3Var(o, 'position', json.object.position, customData);
				if(json.object.scale) setVector3Var(o, 'scale', json.object.scale, customData);
				obj.add(o);
			} else if(json.text) {
				const font = this.scene.findLoadedResource('m:base_font', 'fonts')!.load!;
				const txt = new THREE.Mesh(new TextGeometry(parseVariable(json.text.content, {...customData,...basicVariables}), { 
					size: json.text.size || 1,
					font,
					height: json.text.height || 0.1
				}));
				if(json.text.position) txt.position.set(json.object.position.x, json.object.position.y, json.object.position.z);
				obj.add(txt);
			} 

			const material = materialParser(json.material, this.scene, customData);
			
			obj.traverse((s: any) => (s.isMesh) ? (s as any).material = material : null);

			if(pos) obj.position.set(pos.x, pos.y, pos.z);

			return new Particle(obj, Array.isArray(json.velocity[0]) ? json.velocity.map(v => new THREE.Vector3(...v)) : new THREE.Vector3(...json.velocity), json.lifetime, json.count, json.scatter);
		});
	}
}
