import { Scene3D } from "enable3d";


export class SceneManager {

	static addQueue: THREE.Object3D[] = [];
	static removeQueue: THREE.Object3D[] = [];

	static scene: Scene3D;

	static add(object: THREE.Object3D){
		this.addQueue.push(object);
	}

	static remove(object: THREE.Object3D){
		this.removeQueue.push(object);
	}

	static addAnimated(object: THREE.Object3D, cb?: () => any){
		let posYOriginal = object.position.y;
		let tenPercent = Math.abs(posYOriginal == 0 ? 0.5 : posYOriginal * 0.5);
		SceneManager.scene.scene.add(object);
		let frames = 0;

		object.position.y = posYOriginal - tenPercent;
		
		const oneFrame = () => {
			if(object.position.y === posYOriginal || frames == 60) return cb?.();
			setTimeout(() => {
				object.position.y += tenPercent * 0.5;
				oneFrame();
				frames++;
			}, 1);
		}

		oneFrame();
	}

}