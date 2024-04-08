import { Scene3D, THREE } from "enable3d";
import { Chunks } from "../repositories/chunks";
import { Settings } from "../settings/settings";
import { SceneManager } from "../common/sceneman";
import { ResourceMap } from "../repositories/resources";
import { PlayerInfo } from "../repositories/player";
import { Entities } from "../repositories/entities";
import { ping } from "../socket/socket";
import { Utils } from "../modules/utils";
// import { xyz } from "../common/xyz";

export class MainScene extends Scene3D {

  constructor() {
    super({ key: 'MainScene' })
  }

	init(){
		SceneManager.scene = this;
	}

	async preload() {
		await ResourceMap.loadAll(this);	
	}

	async create() {
		this.warpSpeed('-ground');

		Chunks.init();
		const player = Entities.spawn(PlayerInfo.entity);
		PlayerInfo.setPlayerEntity(player);

		this.camera.position.set(25, 25, 25);

		player.on('setTarget', (position) => {
			ping('entity:settarget', {entity: player.id, position});
		});

		player.displace(new THREE.Vector3(Utils.randFrom(-10, 10), 0, Utils.randFrom(-10, 10)));

		Entities.ping();

	}

	update(){

		Chunks.update(PlayerInfo.entity.object3d.position, Settings.renderDistance);
		Entities.update();

	}

}
