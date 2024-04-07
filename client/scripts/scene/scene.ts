import { Scene3D } from "enable3d";
import { Chunks } from "../repositories/chunks";
import { Settings } from "../settings/settings";
import { SceneManager } from "../common/sceneman";

export class MainScene extends Scene3D {

  constructor() {
    super({ key: 'MainScene' })
  }

	async create() {
		this.warpSpeed();

		Chunks.init();
	}

	update(){

		Chunks.update(Settings.renderDistance);

		if(SceneManager.addQueue.length) this.scene.add(SceneManager.addQueue.pop()!);
		if(SceneManager.removeQueue.length) this.scene.remove(SceneManager.removeQueue.pop()!);

	}

}
