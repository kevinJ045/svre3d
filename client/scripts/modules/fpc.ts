import { CustomScene } from "./models/scene.js";
import { Player } from "./player.js";
import { THREE } from "enable3d";

export function firstPersonControls(scene: CustomScene, player: Player){
	
	scene.controls.update(player.moveRight * 3, player.moveTop * 3);
	player.moveRight = player.moveTop = 0;

	
	var quaternion = new THREE.Quaternion().setFromEuler(player.mesh.rotation);

	// Get the forward direction vector based on the player's rotation
	var movementDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
	var rightDirection = new THREE.Vector3().crossVectors(movementDirection, new THREE.Vector3(0, 1, 0));

	let speed = player.speed + player.speedBoost;

	if(scene.keys.shift === true) speed /= 2;

	const v3 = new THREE.Vector3()

	const rotation = scene.camera.getWorldDirection(v3)
	const theta = Math.atan2(-rotation.x, -rotation.z)
	const rotationMan = player.mesh.getWorldDirection(v3)
	const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
	player.mesh.body.setAngularVelocityY(0)

	const l = Math.abs(theta - thetaMan)
	let rotationSpeed = 4;
	let d = Math.PI / 24;

	if (l > d) {
		if (l > Math.PI - d) rotationSpeed *= -1
		if (theta < thetaMan) rotationSpeed *= -1
		player.mesh.body.setAngularVelocityY(rotationSpeed)
	}


	if(scene.keys.w == true && !scene.keys.s){
		player.run({
			x: movementDirection.x * speed,
			z: movementDirection.z * speed
		}, scene.keys.shift === true);
	} else if(scene.keys.s == true && !scene.keys.w){
		player.run({
			x: movementDirection.x * -speed/1.5,
			z: movementDirection.z * -speed/1.5
		}, scene.keys.shift === true);
	} else {
		if(player.isRunning) player.run({
			x: 0,
			z: 0
		});
	}
		
	if(scene.keys.a == true && !scene.keys.d){
		player.run({
			x: rightDirection.x * -speed/1.5,
			z: rightDirection.z * -speed/1.5
		});
	} else if(scene.keys.d == true && !scene.keys.a){
		player.run({
			x: rightDirection.x * speed/1.5,
			z: rightDirection.z * speed/1.5
		});
	} else {
		// if(this.player.isRunning) this.player.run({
		//   x: 0
		// });
	}

	if(!scene.keys.d && !scene.keys.a && !scene.keys.s && !scene.keys.w) {
		if(player.isRunning) player.idle();
	}
}