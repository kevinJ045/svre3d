import { Scene3D, THREE } from "enable3d";
import { Chunks } from "../repositories/chunks";
import { Settings } from "../settings/settings";
import { SceneManager } from "../common/sceneman";
import { ResourceMap } from "../repositories/resources";
import { PlayerInfo } from "../repositories/player";
import { Entities } from "../repositories/entities";
import { ping } from "../socket/socket";
import { Utils } from "../modules/utils";
import { CameraManager } from "../controls/camera";
import { Controls } from "../controls/controls";
import UI from "../ui/uiman";
import { Lights } from "./lights";
import { Items } from "../repositories/items";
import { ItemData } from "../../../server/models/item";
import { Item } from "../models/item";
// import { xyz } from "../common/xyz";

export class MainScene extends Scene3D {

  constructor() {
    super({ key: 'MainScene' })
  }

	init(){
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(window.innerWidth, window.innerHeight);

		SceneManager.scene = this;
	}

	async preload() {
		await ResourceMap.loadAll(this);	
	}

	async create() {
		const { lights } = await this.warpSpeed('camera', 'light', 'sky');

		Lights
		.setLights(lights!)
		.initLights();

		Chunks.init();
		const player = Entities.spawn(PlayerInfo.entity)!;
		PlayerInfo.setPlayerEntity(player);

		// this.camera.position.set(25, 25, 25);

		player.on('setTarget', (position) => {
			ping('entity:settarget', {entity: player.id, position});
		});

		// player.displace(new THREE.Vector3(Utils.randFrom(-10, 10), 0, Utils.randFrom(-10, 10)));
		Chunks.update(PlayerInfo.entity.object3d.position, Settings.get('renderDistance'));
		player.on('move', () => {
			Chunks.update(PlayerInfo.entity.object3d.position, Settings.get('renderDistance'));
		});

		player.on('inventory', () => {
			ping('player:inventory', {
				inventory: player.inventory.map(i => ({ id: i.itemID, data: i.data, quantity: i.quantity })),
				username: PlayerInfo.username
			})
		});

		// ping('player:inventory', {
		// 	inventory: [{ id: 'm:horn-1', data: {}, quantity: 1 }, { id: 'm:rubidium', data: {}, quantity: 3 }, { id: 'm:oreon', data: {}, quantity: 6 }],
		// 	username: PlayerInfo.username
		// })

		player.on('equip', () => {
			PlayerInfo.updateEquipmentData();
		});

		player.on('unequip', () => {
			PlayerInfo.updateEquipmentData();
		});

		Entities.ping();

		CameraManager.setCamera(this.camera);
		UI.init();
		Controls.initControls(this.canvas);

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:horn-1',
		// 	quantity: 1
		// })));

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:rubidium',
		// 	quantity: 1
		// })));

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:oreon',
		// 	quantity: 5
		// })));

		// Items.crafting(...player.inventory.slice(1, 3) as any);

	}

	update(){

		Entities.update();
		Controls.update();
		UI.update();

	}

}
