import { PointerDrag, PointerLock, THREE } from "enable3d";
import { Chunks } from "../repositories/chunks.js";
import { CameraManager } from "./camera.js";
import { PlayerInfo } from "../repositories/player.js";
import { Keyboard } from "./keyboard.js";
import { Mouse } from "./mouse.js";
import { Settings } from "../settings/settings.js";
import { KeyMap } from "../settings/keymap.js";
import { SceneManager } from "../common/sceneman.js";
import { FirstPersonControls } from "../lib/FirstPersonControls.js";
import UI from "../ui/uiman.js";


export class Controls {

	// static keys = new Keyboard

	static controlMode: 0 | 1 = 0;
	static pointerLock: PointerLock | null;

	static move = { x: 0, y: 0 };

	static canvas: HTMLCanvasElement;
	static controls: FirstPersonControls;

	static initControls(canvas: HTMLCanvasElement){
		
    // this.camera.layers.set(0);
		Mouse.init(canvas);
		Keyboard.init();
		Controls.canvas = canvas;

		Keyboard.register_keys(Object.values(KeyMap.keymap), true);
    
		const pointerDrag = new PointerDrag(canvas);
		pointerDrag.onMove(delta => {
			if (!this.pointerLock) return;
			if (!this.pointerLock.isLocked()) return;
			const { x, y } = delta;
			Controls.move.y = -y * (Settings.get('controls.sensitivity') as number)
			Controls.move.x = x * (Settings.get('controls.sensitivity') as number)
		});

		(SceneManager.scene as any).controls = new FirstPersonControls(CameraManager.camera as any, PlayerInfo.entity.object3d, {
			offset: new THREE.Vector3(0, 1, 0)
		}) as any;


		Keyboard.listen(KeyMap.getKey('controls.mode'), () => {
			this.toggleFirstPerson();
		});
		
		Keyboard.listen(KeyMap.getKey('camera.lock'), () => {
			CameraManager.toggleLock();
		});

		Keyboard.listen(KeyMap.getKey('camera.angle'), () => {
			CameraManager.changeCameraAngle();
		});

		Keyboard.listen(KeyMap.getKey('move.jump'), () => {
			PlayerInfo.entity.jump();
		});
		
		Keyboard.listen(KeyMap.getKey('ui.inventory'), () => {
			UI.toggle();
		});

		Keyboard.listen(KeyMap.getKey('ui.chats'), () => {
			UI.openChats();
		});

		Keyboard.listen(KeyMap.getKey('ui.interact'), () => {
			PlayerInfo.interact();
		});
	}

	static toggleFirstPerson(){
		if(Controls.controlMode){
			CameraManager.cameraPosition.lookat = false;
			Controls.controlMode = 0;
			CameraManager.cameraPosition.offset = CameraManager.cameraPosition.angles[CameraManager.cameraPosition.current];

			Controls.pointerLock!.exit();
			Controls.pointerLock = null;

			PlayerInfo.entity.object3d.visible = true;
			document.body.classList.remove('crosshair');
		} else {
			CameraManager.cameraPosition.offset = new THREE.Vector3(0, 1, -2);
			CameraManager.cameraPosition.lookat = new THREE.Vector3(0, 1, -3);
			Controls.controlMode = 1;
			
			Controls.pointerLock = new PointerLock(Controls.canvas);

			PlayerInfo.entity.object3d.visible = false;

			document.body.classList.add('crosshair');
		}
	}

	static firstPersonControls(){
		(SceneManager.scene as any).controls.update(this.move.x, this.move.y);
		this.move.x = this.move.y = 0;

		if(!PlayerInfo.entity || !PlayerInfo.entity.object3d || !PlayerInfo.entity.object3d.body) return;


		var quaternion = new THREE.Quaternion().setFromEuler(PlayerInfo.entity.object3d.rotation);

		var movementDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
		var rightDirection = new THREE.Vector3().crossVectors(movementDirection, new THREE.Vector3(0, 1, 0));

		let speed = PlayerInfo.entity.speed;

		const v3 = new THREE.Vector3()

		const rotation = CameraManager.camera.getWorldDirection(v3)
		const theta = Math.atan2(-rotation.x, -rotation.z)
		const rotationMan = PlayerInfo.entity.object3d.getWorldDirection(v3)
		const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
		PlayerInfo.entity.object3d.body.setAngularVelocityY(0)

		const l = Math.abs(theta - thetaMan)
		let rotationSpeed = 4;
		let d = Math.PI / 24;

		if (l > d) {
			if (l > Math.PI - d) rotationSpeed *= -1
			if (theta < thetaMan) rotationSpeed *= -1
			PlayerInfo.entity.object3d.body.setAngularVelocityY(rotationSpeed)
		}

		const fwd = Keyboard.isPressed(KeyMap.getKey('move.forward'))
		const bwd = Keyboard.isPressed(KeyMap.getKey('move.backward'))
		
		const ld = Keyboard.isPressed(KeyMap.getKey('move.left'))
		const rd = Keyboard.isPressed(KeyMap.getKey('move.right'))
		
		let movementVector = new THREE.Vector3();
		
		if (fwd && !bwd) {
			movementVector.add(movementDirection);
		} else if (bwd && !fwd) {
			movementVector.add(movementDirection.multiplyScalar(-1));
		}
		
		if (ld && !rd) {
			movementVector.add(rightDirection.multiplyScalar(-1));
		} else if (rd && !ld) {
			movementVector.add(rightDirection);
		}
		
		const diagonalSpeed = speed/2;
		
		if ((fwd || bwd) && (ld || rd)) {
			movementVector.multiplyScalar(diagonalSpeed);
		} else {
			movementVector.multiplyScalar(speed);
		}
		
		if(movementVector.length() > 0) {
			PlayerInfo.entity.run({
				x: movementVector.x,
				z: movementVector.z
			});
		} else {
			PlayerInfo.entity.run({
				x: 0,
				z: 0
			});
			PlayerInfo.entity.idle();
		}

	}

	static update(){
		if(Controls.controlMode == 1){
			Controls.firstPersonControls();
		} else {
			CameraManager.update();
		}
	}

}