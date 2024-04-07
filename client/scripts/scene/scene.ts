import { Scene3D, THREE } from "enable3d";
import { Chunks } from "../repositories/chunks";
import { Settings } from "../settings/settings";
import { SceneManager } from "../common/sceneman";

export class MainScene extends Scene3D {

  constructor() {
    super({ key: 'MainScene' })
  }

	init(){
		SceneManager.scene = this;
	}

	playerPosition: any;

	async create() {
		this.warpSpeed();

		Chunks.init();
		this.playerPosition = new THREE.Vector3();

		this.camera.position.set(25, 25, 25);

	}

	update(){

		Chunks.update(this.playerPosition, Settings.renderDistance);

		if(SceneManager.addQueue.length) this.scene.add(SceneManager.addQueue.pop()!);
		if(SceneManager.removeQueue.length) this.scene.remove(SceneManager.removeQueue.pop()!);

		// this.playerPosition.x += 1;

	}

}
