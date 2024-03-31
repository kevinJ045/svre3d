import { ExtendedObject3D, Scene3D, THREE } from "enable3d";
import { item } from "./models/item";
import { Item } from "./models/item2";



export class Player {
	player!: ExtendedObject3D;
	playerData!: item;
	physics!: typeof Scene3D.prototype.physics;
	items = 0;

	inventory: Item[] = [];

	wearables : Record<string, Item | null> = {
		hat: null,
		eye: null,
		armor: null,
		attachment: null,
	};

	constructor(physics: typeof Scene3D.prototype.physics, player: ExtendedObject3D, playerItem: item){
		this.player = player;
		this.playerData = playerItem;
		this.physics = physics;


		this.player.body.on.collision((otherObjecr) => {
			if(otherObjecr.name == 'chunk' && this.canJump == false){
				this.canJump = true;
			}
		});
	}

	private _playAnimation(index: number){
		this.player.anims.mixer.stopAllAction();
		this.player.anims.mixer
			.clipAction(this.playerData.load.animations[index])
			.reset()
			.play();
	}

	isRunning = false;
	isJumping = false;
	fast = false;
	move = false;
  moveTop = 0;
  moveRight = 0;
	runDirection = {
		x: 0,
		y: 0,
		z: 0
	};

	speed = 10;
	speedBoost = 0;
	rotationSpeed = 10;

	canJump = true;

	targetLocation : null | THREE.Vector3 = null;

	run(direction: {x?:number,y?:number,z?:number}, speed = false){
		if('x' in direction) this.runDirection.x = direction.x!;
		if('y' in direction) this.runDirection.y = direction.y!;
		if('z' in direction) this.runDirection.z = direction.z!;
		if(this.isRunning && (this.fast == speed)) return this;
		console.log('running');
		this._playAnimation(speed ? 2 : 4);
		this.isRunning = true;
		this.fast = speed;
		return this;
	}

	rotate(degrees: number){
		this.physics.destroy(this.player.body);
		this.player.rotation.y += degrees;
		this.physics.add.existing(this.player);
	}

	lookAt(position: THREE.Vector3){
		this.physics.destroy(this.player.body);
		this.player.lookAt(position);
		this.physics.add.existing(this.player);
	}

	idle(){
		if(!this.isRunning) return this;
		this.isRunning = false;
		this._playAnimation(0);
		console.log('idling')
		return this;
	}

	normal(){
		if(!this.isRunning) return this;
		this.isRunning = false;
		this._playAnimation(5);
		return this;
	}



	jump(){
		console.log('jumping');
		if(!this.canJump) return;
		this.isJumping = true;
		this.canJump = false;
		// this.time.addEvent({
		// 	delay: 750,
		// 	callback: () => (this.canJump = true)
		// })
		// this.time.addEvent({
		// 	delay: 750,
		// 	callback: () => {
		// 		this.man.anims.play('idle')
		// 		this.isJumping = false
		// 	}
		// })

		this.player.body.applyForceY(8);
		this.isJumping = false;
		this.idle();
	}

	rotateTowardsTarget() {
    if (this.targetLocation) {
			const rotationSpeed = this.rotationSpeed;
			const maxRotation = Math.PI / 24; // Maximum rotation angle per frame

			// Calculate the direction vector towards the target location
			const direction = new THREE.Vector3();
			direction.subVectors(this.targetLocation, this.player.position);
			// direction.x = 0; // Assuming movement is only along x and z axes
			direction.y = 0; // Assuming movement is only along x and z axes
			// direction.z = 0; // Assuming movement is only along x and z axes

			var quaternion = new THREE.Quaternion().setFromEuler(this.player.rotation);

			const currentDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
			let theta = Math.atan2(direction.x, direction.z) - Math.atan2(currentDirection.x, currentDirection.z);

			if (theta > Math.PI) {
				theta -= 2 * Math.PI;
			} else if (theta < -Math.PI) {
				theta += 2 * Math.PI;
			}

			const deltaTheta = THREE.MathUtils.clamp(theta, -maxRotation, maxRotation);

			// console.log(deltaTheta, Math.abs(deltaTheta), deltaTheta * rotationSpeed);

			if (Math.abs(deltaTheta * rotationSpeed) < 1) {
				this.player.body.setAngularVelocityY(0);
				return true;
			} else {
				this.player.body.setAngularVelocityY(deltaTheta * rotationSpeed);
			}
    }
		return false;
	}

	moveTowardsTarget() {
    if (this.targetLocation) {
			const direction = new THREE.Vector3();
			direction.subVectors(this.targetLocation, this.player.position);
			direction.y = 0; 

			direction.normalize();

			const speed = this.speed + this.speedBoost; // Adjust as needed

			const distanceToTarget = this.player.position.distanceTo(this.targetLocation);
			
			if (distanceToTarget < 1) {
					this.targetLocation = null;
					this.idle();
					this.player.body.setAngularVelocityY(0);
			} else {
        const looking = this.rotateTowardsTarget();

				if(looking) this.run({
					x: direction.x * speed,
					z: direction.z * speed
				});
			}
    }
	}

	inInventory(item: Item){
		return this.inventory.find(i => i.id == item.id);
	}

	fromName(name: string){
		// const item = new Item("");
	}

	ownItem(item: Item){
		if(item.player?.player.uuid == this.player.uuid) return true;
		item.setParentPlayer(this);
		return true;
	}

	toInventory(item: Item){
		if(this.inInventory(item)) return true;
		else {
			this.ownItem(item);
			this.inventory.push(item);
			this.updateInventory(item, 'add');
			return true;
		}
	}

	fromInventory(item: Item){
		const ini = this.inInventory(item);
		if(!ini) return false;
		this.inventory.splice(this.inventory.indexOf(ini), 1);
		this.updateInventory(ini, 'remove');
		return true;
	}

	unwearAccessory(wearable: Item){
		const { item } = wearable;
    if(item.type !== "accessory" || !item) return;
		const head = this.player.children[0].children[0].children[0].children[0];
		head.remove(wearable?.mesh!);
		wearable.mesh = undefined;
		this.toInventory(wearable);
		this.wearables[item.accessory.type] = null;
	}

	wearAccessory(wearable: Item){
		const { item } = wearable;
    if(item.type !== "accessory" || !item) return;

		if(!this.inInventory(wearable)) return false;

    const item_mesh = item.mesh!.clone();
    (item_mesh as any).details = item;

		wearable.mesh = item_mesh;

    const head = this.player.children[0].children[0].children[0].children[0];

		if(this.wearables[item.accessory.type]) {
			const w = this.wearables[item.accessory.type];
			this.unwearAccessory(w!);
		}
		
    head.add(item_mesh);
		this.wearables[item.accessory.type] = wearable;

		this.fromInventory(wearable);

		this.updateInventory(wearable, 'wear');

    item_mesh.position.x += item.config!.position.x;
    item_mesh.position.y += item.config!.position.y;
    item_mesh.position.z += item.config!.position.z;

    if(item.config!.scale){
      item_mesh.scale.x = item.config!.scale.x;
      item_mesh.scale.y = item.config!.scale.y;
      item_mesh.scale.z = item.config!.scale.z;
    }

		return true;
  }

	_inventoryListeners: ({
		f: (item: Item, type?: string) => any,
		type
	})[] = [];
	updateInventory(item:Item, type: string){
		this._inventoryListeners.filter(f => f.type == type || f.type == 'all').forEach(c => {
			c.f(item, type);
		});
	};

	onInventory(type, f: (item: Item, type?: string) => any){
		this._inventoryListeners.push({
			f,
			type
		});
		return true;
	}


}