import { ExtendedObject3D, THREE } from "enable3d";
import { EntityData } from "../../../server/models/entity.js";
import { xyz, xyzTv, xyzt } from "../common/xyz.js";
import { PhysicsManager } from "../common/physics.js";
import { Chunks } from "../repositories/chunks.js";
import { Entities } from "../repositories/entities.js";
import { ChunkData } from "../../../server/models/chunk.js";
import { SceneManager } from "../common/sceneman.js";
import { Item } from "./item.js";
import { ping, pingFrom } from "../socket/socket.js";
import { Random } from "../../../server/common/rand.js";



export class Entity extends EntityData {

	object3d!: ExtendedObject3D;
	
	private _animationTimeout: any = 0;
	private _playAnimation(action: string, speed = 1, loop = true, callback?: () => void){

		let name = action;
		if(this.reference.animation?.[name]) name = this.reference?.animation[name];
		if(Array.isArray(name)) name = Random.pick(...name);

		let anim = this.reference.resource.load.animations.find(anim => anim.name == name);

		// console.log(this.reference.resource.load.animations, anim);

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

	targetLocationList: xyzt[] = [];
	displace(position: xyzt | null, removePrevious = false){
		if(removePrevious) this.targetLocationList = [];
		this.targetLocation = position;
		this.emit('setTarget', this.targetLocation);
	}



	get targetLocation(){
		return this.targetLocationList.length ? this.targetLocationList[0] : null; 
	}

	set targetLocation(position: xyzt | null){
		if(position){
			this.targetLocationList.push(position);
		} else {
			this.targetLocationList.shift();
		}
	}

	destroy(){
		this.rmPhysics();
		SceneManager.scene.scene.remove(this.object3d);
	}

	rmPhysics(){
		PhysicsManager.destroy(this.object3d);
	}

	addPhysics(){
		PhysicsManager.addPhysics(this.object3d, this.reference.view?.physics || { shape: 'convex' })
		this.object3d.body.setFriction(0.8);
		this.object3d.body.setAngularFactor(0, 0, 0);
		this.object3d.body.on.collision((otherObject, event) => {
			if(event == 'collision') this.emit('collision', {object: otherObject});
			// if(this.reference.id == 'm:goober') console.log(otherObject.position.y - this.object3d.position.y)
			// console.log(otherObject.position.y - this.object3d.position.y > -0.5);
			if(event == 'collision' && otherObject.name == 'chunk'){
				const box = new THREE.Box3().setFromObject(this.object3d);
				const sizeParent = new THREE.Vector3();
				box.getSize(sizeParent);
				if((otherObject.position.y - this.object3d.position.y) + (this.type === "i:player" ? 0 : sizeParent.y) > (this.type == "i:player" ? -0.5 : sizeParent.y / 4)){
					// console.log('Higher Block');
					this.hasHigherBlocks = true;
				} else {
					this.data.canjump = true;
				}
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

	jump(){
		if(this.data.canjump !== false) {
			this.object3d.body.applyForceY(5);
			this.data.canjump = false;
		}
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
		ping('entity:attack', {
			entity: this.id,
			target: target.id
		});
	}

	hasHigherBlocks = false;
	detectObstacles(position: THREE.Vector3, direction: THREE.Vector3) {
		const obstacles = {
			hasSolidObject: false,
			hasHigherBlocks: false,
			hasEntity: false
		};

		const pos = this.object3d.position.clone().add(direction.clone()).multiplyScalar(-1);
		const pos2 = this.object3d.position.clone().sub(direction.clone());
		// console.log(pos, position);

		// Perform raycast to detect obstacles in front of the player
		const raycaster = new THREE.Raycaster(pos, position);
		const intersects = raycaster.intersectObjects(Chunks.chunkObjects(), true);
		const intersectsEntity = raycaster.intersectObjects(Entities.entities.map(entity => entity.object3d).filter(mesh => mesh.uuid !== this.object3d.uuid), true);

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
				// obstacles.hasHigherBlocks = true;
			}

			if(intersects[0].object.children.some(i => i.name.startsWith('chunk.'))){
				obstacles.hasSolidObject = true;
			}
		}

		// if(intersectsEntity.length > 0){
		// 	obstacles.hasEntity = true;
		// }

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

	fixEquipmentLayers(){
		this.object3d.traverse(node => {
			if ((node as any).isBone && node.userData.attachment) {
				const attachment = node.userData.attachment;

				attachment.forEach((attachment) => {
					const parentBoneMatrix = new THREE.Matrix4().copy(attachment.parent.matrixWorld);
					const attachmentMatrix = new THREE.Matrix4().copy(node.matrix);
					const parentPos = new THREE.Vector3();
					parentPos.setFromMatrixPosition(parentBoneMatrix);

					// Get the attachment's position relative to its parent bone
					const attachmentMatrixInWorldSpace = attachmentMatrix.multiply(parentBoneMatrix);
					const position = new THREE.Vector3();
					position.setFromMatrixPosition(attachmentMatrixInWorldSpace);

					// Get the z offset from attachment's user data
					const defaultZOffset = attachment.userData?.defaultPosition?.z || 0;

					// Calculate the z position with the offset relative to the parent bone
					let z = position.y - (parentPos.y + defaultZOffset);

					// Ensure z position doesn't go below the specified default position
					if (z < defaultZOffset) {
						z = defaultZOffset;
					}

					if(z > 0) z = -z;

					attachment.position.z = z;
				});
				
			}
		});
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

	moveTowardsTarget(pos?: any) {
    	if (this.targetLocation || pos) {
			(this.targetLocation || pos).y = this.object3d.position.y;
			const direction = new THREE.Vector3();
			direction.subVectors(this.targetLocation || pos, this.object3d.position);
			direction.y = 0; 

			direction.normalize();

			const speed = (this.speed) / (this.isState('Sneak') ? 2 : 1); 

			const distanceToTarget = this.object3d.position.distanceTo(this.targetLocation || pos);

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

				// console.log(obstacles.hasHigherBlocks);

				if(looking) {
					if (obstacles.hasHigherBlocks) {
						// console.log(obstacles.hasHigherBlocks);
						this.addPos(0, 1.5, 0);
						// this.run({ x: 0, z: 0});
					} else if (obstacles.hasSolidObject || obstacles.hasEntity) {
						const avoidanceDirection = this.avoidObstacles(nextStep, obstacles);
						this.run({
								x: avoidanceDirection.x * speed,
								z: avoidanceDirection.z * speed
						});
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

	update(time){
		if(this.attackTarget){
			this.moveTowardsTarget(this.attackTarget.position ? xyzTv(this.attackTarget.position) : (this.attackTarget as Entity).object3d.position);
		} else if(this.targetLocation) {
			this.moveTowardsTarget();
		}

		if(!Chunks.findChunkAtPosition(this.object3d.position)){
			this.object3d.body.setVelocity(this.runDirection.x, 0, this.runDirection.z);
		}

		if(this.object3d.position.y < -20){
			this.rmPhysics();
			this.object3d.position.set(this.object3d.position.x, 5, this.object3d.position.z);
			this.addPhysics();
		}

		if(this.runDirection.x || this.runDirection.z){
			if(this.hasBlockNextStep()){
				this.object3d.body.setVelocity(this.runDirection.x, this.object3d.body.velocity.y, this.runDirection.z);
				this.emit('move', this.runDirection, this.object3d.position.clone().add(this.runDirection));
			}
		} else {
			this.object3d.body.setVelocity(0, this.object3d.body.velocity.y, 0);
		}

		if(this.type == 'player'){
			this.fixEquipmentLayers();
		}

		if(this.object3d.userData.$hitboxUpdate){
			this.object3d.userData.$hitboxUpdate();
		}

		this.emit('update', time);
	}


	dropItem(item: string){
		ping('entity:drop', { 
			entity: this.id,
			item: item,
			direction: {
				x: 0,
				y: 0,
				z: 2
			}
		});
	}

	// Method to add an item to the inventory
	addToInventory(item: Item, send = true): void {
		const type = super.addToInventory(item);
		if(!type) return;
		this.emit('inventory:add', {item});
		this.emit('inventory', {type: 'add', item});
		if(send) this.sendInventoryUpdateToServer(item, item.quantity, 'add', type);
	}

	setInventory(inventory: Item[], send = true){
		this.inventory = inventory;
		this.emit('inventory', {type: 'full'});
		if(send) this.sendInventoryUpdateToServer(null, null, 'full', 'full');
	}

	// Method to remove an item from the inventory
	removeFromInventory(item: Item, count: number = 1, send = true): void {
		const type = super.removeFromInventory(item, count);
		if(!type) return;
		this.emit('inventory:remove', {item});
		this.emit('inventory', {type: 'remove', item});
		if(send) this.sendInventoryUpdateToServer(item, count, 'remove', type);
	}


	private sendInventoryUpdateToServer(item: Item | null, count, type: string, action: string): void {
		ping('entity:inventory', {
			entity: this.id,
			item: item ? {
				id: item.id,
				type: item.itemID,
				quantity: item.quantity,
				count,
				data: item.data
			} : {},
			action,
			type,
			full: type == 'full',
			inventory: type == 'full' ? this.inventory : []
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