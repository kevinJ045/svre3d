import { ExtendedObject3D, THREE } from "enable3d";
import { EntityData } from "../../../server/models/entity";
import { xyz, xyzt } from "../common/xyz";
import { PhysicsManager } from "../common/physics";
import { Chunks } from "../repositories/chunks";
import { Entities } from "../repositories/entities";
import { ChunkData } from "../../../server/models/chunk";
import { SceneManager } from "../common/sceneman";
import { Item } from "./item";
import { ping, pingFrom } from "../socket/socket";
import { Random } from "../../../server/common/rand";



export class Entity extends EntityData {

	object3d!: ExtendedObject3D;

	private _eventListeners: {type:string,f:CallableFunction}[] = [];
	on(type:string,f:CallableFunction){
		this._eventListeners.push({type, f});
		return this;
	}
	emit(type:string,...args: any[]){
		this._eventListeners
		.filter(e => e.type == type)
		.forEach(e => e.f(...args));
		return this;
	}

	
	private _animationTimeout: any = 0;
	private _playAnimation(action: string, speed = 1, loop = true, callback?: () => void){

		let name = action;
		if(this.reference.config?.animations?.[name]) name = this.reference.config?.animations[name];
		if(Array.isArray(name)) name = Random.pick(...name);

		let anim = this.reference.load.animations.find(anim => anim.name == name);

		if(this.object3d.anims.mixer.timeScale != speed) this.object3d.anims.mixer.timeScale = speed;
		this.object3d.anims.mixer.stopAllAction();
		if(anim) {
			clearTimeout(this._animationTimeout);
			if(this._animationQueues.length) this._animationQueues.forEach(i => this.removeAnimQueue(i));
			const a = this.object3d.anims.mixer
			.clipAction(anim);
			a.reset();
			if(!loop) a.loop = THREE.LoopOnce;
			a.clampWhenFinished = true;

			a.play();

			this._animationTimeout = setTimeout(() => {
				if(typeof callback == "function") callback();
			}, a.getClip().duration * 1000);

			if(this._animationListeners.length) this._animationListeners.filter(
				i => i.name == action
			).forEach(i => i.fn());

			return a;
		}

		return null;
	}

	private _animationListeners: { name: string, fn: () => void, done: boolean }[] = [];
	private _animationQueues: any[] = []; 
	onAnimation(name: string, fn: () => void, done = false){
		this._animationListeners.push({name, fn, done});
		return this;
	};
	offAnimation(fn: () => void){
		const f = this._animationListeners.find(i => i.fn == fn);
		if(f) {
			const index = this._animationListeners.indexOf(f);
			this._animationListeners.splice(index, 1);
		}
	}
	animQueue(queue){
		this._animationQueues.push(queue);
		return this;
	}
	removeAnimQueue(queue){
		clearTimeout(queue);
		this._animationQueues.splice(this._animationQueues.indexOf(queue));
		return this;
	}
	playAnimation(name: string, speed = 1, loop = true, callback?: () => void){
		return this._playAnimation(name, speed, loop, callback);
	}

	targetLocation: xyzt | null = null;
	displace(position: xyzt | null){
		this.targetLocation = position;
		this.emit('setTarget', this.targetLocation);
	}

	destroy(){
		PhysicsManager.destroy(this.object3d);
		SceneManager.scene.scene.remove(this.object3d);
	}

	addPhysics(){
		PhysicsManager.addPhysics(this.object3d, this.reference!.config?.physics || { shape: 'convex' })
		this.object3d.body.setFriction(0.8);
    	this.object3d.body.setAngularFactor(0, 0, 0);
		this.object3d.body.on.collision((otherObject, event) => {
			if(event == 'collision') this.emit('collision', {object: otherObject});
			// if(this.reference.id == 'm:goober') console.log(otherObject.position.y - this.object3d.position.y)
			if(event == 'collision' && otherObject.name == 'chunk' && otherObject.position.y - this.object3d.position.y > -1){
				this.hasHigherBlocks = true;
			}
		});
		
	}

	addPos(x, y, z){
		PhysicsManager.destroy(this.object3d);
		this.object3d.position.x += x;
		this.object3d.position.y += y;
		this.object3d.position.z += z;
		this.addPhysics();
	}

	setHealth(health: typeof Entity.prototype.health, ping = true){
		this.health = health;
		if(ping) this.sendHealthUpdateToServer();
		this.emit('health');
	}

	recieveDamage(damage: number, attacker: Entity){
		const finalDamage = damage - (this.defense || 0);
		this.setHealth({
			max: this.health.max,
			current: this.health.current - finalDamage
		});
		const knockbackDirection = this.object3d.position.clone().sub(attacker.object3d.position).normalize();

		// this.previousAttacker = attacker;

		if (this.object3d.body) {
			this.object3d.body.applyForce(knockbackDirection.x * 5, 0, knockbackDirection.z * 5);
		}
	}

	attacked = false;
	attackCooldown = 200;
	attack(target?: Entity | Entity[]){
		if(this.attacked) return;
		this.attacked = true;
		this._playAnimation('Attack', 1, false, () => {
			if(this.isState('Walk')) this.setState('Walk');
			else this.idle();
		});	

		if(target) {
			if(Array.isArray(target)) target.forEach(target => this.sendDamage(target));
			else this.sendDamage(target);
		}
		setTimeout(() => this.attacked = false, this.attackCooldown)
	}

	sendDamage(target: Entity){
		target.recieveDamage(this.damage, this);
	}

	hasHigherBlocks = false;
	detectObstacles(position: THREE.Vector3, direction: THREE.Vector3) {
		const obstacles = {
			hasSolidObject: false,
			hasHigherBlocks: false,
			hasEntity: false
		};

		const pos = this.object3d.position.clone().add(direction.clone());
		// console.log(pos, position);

		// Perform raycast to detect obstacles in front of the player
		const raycaster = new THREE.Raycaster(pos, position);
		const intersects = raycaster.intersectObjects(Chunks.chunkObjects(), true);
		const intersectsEntity = raycaster.intersectObjects(Entities.entities.map(entity => entity.object3d).filter(mesh => mesh.uuid !== this.object3d.uuid), true);

		// console.log(intersects);

		if (intersects.length > 0) {
			// intersects[0].object.material = new THREE.MeshBasicMaterial({ color: 0x09d0d0 });
			// console.log(intersects[0].object);
			const chunkY = intersects[0].object.position.y; // Y position of the chunk below next step
			const playerY = this.object3d.position.y; // Y position of the player
			const heightDifference = chunkY - playerY;

			// if (intersects[0].object.name == 'chunk') {
			// 	intersects[0].object.material = new THREE.MeshBasicMaterial({color: 0x00ffff});
			// 	console.log(heightDifference);
			// }

			// If the height difference is exactly 1, make the player jump
			if (intersects[0].object.name == 'chunk' && heightDifference > -1) {
				obstacles.hasHigherBlocks = true;
			}

			if(intersects[0].object.children.some(i => i.name.startsWith('chunk.'))){
				obstacles.hasSolidObject = true;
			}
		}

		if(intersectsEntity.length > 0){
			obstacles.hasEntity = true;
		}

		if(this.hasHigherBlocks){
			this.hasHigherBlocks = false;
			obstacles.hasHigherBlocks = true;
		}


    	return obstacles;
	}

	avoidObstacles(position, obstacles) {

		const avoidanceDirection = new THREE.Vector3();

		// Avoidance behavior based on detected obstacles
		if (obstacles.hasSolidObject) {
			// Move away from solid objects
			avoidanceDirection.subVectors(position, obstacles.closestSolidObject.position).normalize();
		} else if (obstacles.hasHigherBlocks) {
			// Move upwards to avoid higher blocks
			avoidanceDirection.set(0, 1, 0);
		} else {
			// No specific avoidance behavior, move in a random direction
			avoidanceDirection.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
		}

		return avoidanceDirection;
	}

	previousState: string = "";
	setState(state: string){
		this.previousState = this.state;
		this._playAnimation(state);
		this.state = state;
		this.emit('state', state);
	}

	isState(state: string){
		return this.state == state;
	}

	runDirection = new THREE.Vector3();
	run(direction: {x?:number,y?:number,z?:number}){
		if('x' in direction) this.runDirection.x = direction.x!;
		if('y' in direction) this.runDirection.y = direction.y!;
		if('z' in direction) this.runDirection.z = direction.z!;
		if(this.isState('Walk')) return this;
		// console.log('running');
		this.setState('Walk');
		return this;
	}

	idle(){
		this.setState('Idle');
		return this;
	}

	sneak(act: string){
		if(act == 'start') {
			this.setState('Sneak');
		} else {
			if(this.previousState == 'Walk') this.setState('Walk');
			else this.idle();
		}
	}

	rotateTowardsTarget(target?: THREE.Vector3) {
    	if (this.targetLocation || target) {
			const rotationSpeed = 10;
			const maxRotation = Math.PI / 6; // Maximum rotation angle per frame

			// Calculate the direction vector towards the target location
			const direction = new THREE.Vector3();
			direction.subVectors((this.targetLocation! || target), this.object3d.position);
			// direction.x = 0; // Assuming movement is only along x and z axes
			direction.y = 0; // Assuming movement is only along x and z axes
			// direction.z = 0; // Assuming movement is only along x and z axes

			var quaternion = new THREE.Quaternion().setFromEuler(this.object3d.rotation);

			const currentDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
			let theta = Math.atan2(direction.x, direction.z) - Math.atan2(currentDirection.x, currentDirection.z);

			if (theta > Math.PI) {
				theta -= 2 * Math.PI;
			} else if (theta < -Math.PI) {
				theta += 2 * Math.PI;
			}

			const deltaTheta = THREE.MathUtils.clamp(theta, -maxRotation, maxRotation);

			// console.log(deltaTheta, Math.abs(deltaTheta), deltaTheta * rotationSpeed);

			// console.log(Math.abs(deltaTheta * rotationSpeed));

			if (Math.abs(deltaTheta * rotationSpeed) < 0.1) {
				this.object3d.body.setAngularVelocityY(0);
				return true;
			} else {
				this.run({
					x: 0,
					z: 0
				});
				this.object3d.body.setAngularVelocityY(deltaTheta * rotationSpeed);
			}
    	}
		return false;
	}

	moveTowardsTarget() {
    	if (this.targetLocation) {
			this.targetLocation.y = this.object3d.position.y;
			const direction = new THREE.Vector3();
			direction.subVectors(this.targetLocation, this.object3d.position);
			direction.y = 0; 

			direction.normalize();

			const speed = (this.speed) / (this.isState('Sneak') ? 2 : 1); 

			const distanceToTarget = this.object3d.position.distanceTo(this.targetLocation);

			// const box = new THREE.Box3().setFromObject(this.object3d);
			// const sizeParent = new THREE.Vector3();
			// box.getSize(sizeParent);
			// sizeParent.distanceTo(direction)
			// console.log(distanceToTarget - sizeParent.distanceTo(direction));

			if (distanceToTarget < 1.5) {
				console.log('reach');
				this.displace(null);
				this.object3d.body.setAngularVelocityY(0);
				this.run({
					x: 0,
					z: 0
				});
				this.idle();
			} else {
				const nextStep = new THREE.Vector3(direction.x, direction.y + 1, direction.z).add(this.object3d.position);

				const obstacles = this.detectObstacles(nextStep, direction);

				// console.log(obstacles.hasHigherBlocks, nextStep, this.mesh.position);

				const looking = this.rotateTowardsTarget();

				if(looking) {
					if (obstacles.hasHigherBlocks) {
						// console.log(obstacles.hasHigherBlocks);
						this.addPos(0, 1.5, 0);
						// this.run({ x: 0, z: 0});
					} else if (obstacles.hasSolidObject || obstacles.hasEntity) {
						// const avoidanceDirection = this.avoidObstacles(nextStep, obstacles);
						// this.run({
						// 		x: avoidanceDirection.x * speed,
						// 		z: avoidanceDirection.z * speed
						// });
					} else {
						this.run({
							x: direction.x * speed,
							z: direction.z * speed
						});
					}
				}
			}
    	}
	}

	hasBlockNextStep() {
		const nextPosition = this.object3d.position.clone().add(this.runDirection);
	
		const nextChunk = Chunks.findChunkAtPosition(nextPosition);
		
		if (!nextChunk) {
			return false; 
		}
		
		return true;
	}

	update(){
		if(this.targetLocation) this.moveTowardsTarget();

		if(this.runDirection.x || this.runDirection.z){
			if(this.hasBlockNextStep()){
				this.object3d.body.setVelocity(this.runDirection.x, this.object3d.body.velocity.y, this.runDirection.z);
				this.emit('move', this.runDirection, this.object3d.position.clone().add(this.runDirection));
			}
		} else {
			this.object3d.body.setVelocity(0, this.object3d.body.velocity.y, 0);
		}
	}


	// Method to add an item to the inventory
	addToInventory(item: Item, send = true): void {
		const type = super.addToInventory(item);
		if(!type) return;
		this.emit('inventory:add', {item});
		this.emit('inventory', {type: 'add', item});
		if(send) this.sendInventoryUpdateToServer(item, item.quantity, 'add', type);
	}

	// Method to remove an item from the inventory
	removeFromInventory(item: Item, count: number = 1, send = true): void {
		const type = super.removeFromInventory(item, count);
		if(!type) return;
		this.emit('inventory:remove', {item});
		this.emit('inventory', {type: 'remove', item});
		if(send) this.sendInventoryUpdateToServer(item, count, 'remove', type);
	}


	private sendInventoryUpdateToServer(item: Item, count, type: string, action: string): void {
		ping('entity:inventory', {
			entity: this.id,
			item: {
				id: item.id,
				type: item.itemID,
				quantity: item.quantity,
				count,
				data: item.data
			},
			action,
			type
		});
	}

	sendHealthUpdateToServer(){
		ping('entity:hp', {
			entity: this.id,
			hp: this.health
		});
	}

	receiveInventoryUpdateFromServer(update: string, updatedInventory: Item[]): void {
		
	}

}