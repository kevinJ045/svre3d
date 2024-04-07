

export class SceneManager {

	static addQueue: THREE.Object3D[] = [];
	static removeQueue: THREE.Object3D[] = [];

	static add(object: THREE.Object3D){
		this.addQueue.push(object);
	}

	static remove(object: THREE.Object3D){
		this.removeQueue.push(object);
	}

}