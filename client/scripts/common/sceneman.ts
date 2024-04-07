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

}