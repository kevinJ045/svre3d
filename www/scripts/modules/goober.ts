import { ExtendedObject3D, THREE } from "enable3d";
import { Entity } from "./entity";
import { CustomScene } from "./models/scene";
import { Entities } from "./entityman";
import { makeObjectMaterial } from "./shaderMaterial";
import { Utils } from "./utils";

const resolveMaterial = (m, scene) => 
	typeof m == 'string' ? makeObjectMaterial(scene.findLoadedResource(m, 'shaders')!, scene, {}) : m;

export class Goober extends Entity {
	neutral = false;

	getEye(){
		return this.mesh.children[0].children[0].children[3];
	}

	getBody(){
		return this.mesh.children[0].children[0].children[2];
	}

	setMaterials(body: THREE.Material | string, eye?: THREE.Material | string){
		if(eye){
			this.getEye().material = resolveMaterial(eye, this.scene);
		} else {
			this.getEye().material = new THREE.MeshLambertMaterial({ color: '#ffffff' });
		}
		this.getBody().material = resolveMaterial(body, this.scene);
	}

	setBodyMaterial(m: THREE.Material){
		this.setMaterials(m);
	}

	restTime = {
		current: 0,
		max: 200,
		min: 100,
		currentMax: 100
	};

	selectAttackTarget(enemies: Entity[]){
		this.attackTarget = enemies[0];
	}

	findEnemies() {
    const maxDistance = this.maxLookDistnce * this.scene.chunkSize;
    const enemies = this.scene.entities.filter(entity => {
			return entity.variant !== this.variant && !entity.neutral && this.mesh.position.distanceTo(entity.mesh.position) <= maxDistance;
    });

    if (enemies.length) {
      this.selectAttackTarget(enemies);
    }
	}


	selectRandomTarget(){
		const chunks = this.scene.loadedChunks.chunkObjects();
		if(chunks.length) this.targetLocation = Utils.pickRandom(...chunks).position.clone()
	}

	thinkNoAttackTarget(){

		this.findEnemies();

		this.restTime.current++;
		if(this.restTime.current > this.restTime.currentMax){
			this.restTime.current = 0;
			this.restTime.currentMax = Utils.randFrom(this.restTime.min, this.restTime.max);

			if(!this.targetLocation){
				this.selectRandomTarget();
			}
		} else {
			if(!this.init) {
				this.init = true;
				if(Utils.randFrom(0, 3) == 2) this.selectRandomTarget();
			}
			super.think();
		}
	}

	thinkAttackTarget(){
		if(this.attackTarget){
			const newPosition = this.attackTarget.mesh.position.clone();
			const distance = this.mesh.position.distanceTo(this.attackTarget.mesh.position);
			if(distance < 12) {
				this.targetLocation = null;
				this.run({x: 0, z:0});
				this.rotateTowardsTarget(newPosition);
				this.idle();

				this.attack(this.attackTarget);

			} else if(!this.targetLocation){
				this.targetLocation = newPosition;
			} else {
				super.think();
			}
		}
	}

	init = false;
	think() {
		
		if(this.attackTarget){
			this.thinkAttackTarget()
		} else {
			this.thinkNoAttackTarget();
		}
		
	}

	static entityMeshLoader(scene: CustomScene, name: string, pos?: THREE.Vector3) {
		const o = new ExtendedObject3D();

    const gload = scene.findLoadedResource('m:goober', 'objects')!;
    const gmesh = gload.mesh!.clone(true);

		console.log(gload.load);

		gmesh.traverse(child => {
      child.castShadow = true
      child.receiveShadow = false
    });

		o.add(gmesh);

		if(pos) o.position.copy(pos);

		scene.add.existing(o);
		const p = new this(scene, o, gload);
		p.addPhysics(o);

		p.name = name;

		p.beforeInit();

		p.onCollision((otherobject) => {
			if(otherobject.object.position.y - p.mesh.position.y > 0){
				p.hasHigherBlocks = true;
			}
		});

		p.playAnimation('Normal');
		
		return p;
	}

	beforeInit(){
		this.setMaterials(new THREE.MeshBasicMaterial({ color: '#08c1c1' }));
	}

}