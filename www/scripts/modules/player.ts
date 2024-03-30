import { ExtendedObject3D, Scene3D } from "enable3d";
import { item } from "./models/item";



export class Player {
	player!: ExtendedObject3D;
	playerData!: item;
	physics!: typeof Scene3D.prototype.physics;

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

	canJump = true;

	run(direction: {x?:number,y?:number,z?:number}, speed = false){
		if('x' in direction) this.runDirection.x = direction.x!;
		if('y' in direction) this.runDirection.y = direction.y!;
		if('z' in direction) this.runDirection.z = direction.z!;
		if(this.isRunning && (this.fast == speed)) return this;
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
}