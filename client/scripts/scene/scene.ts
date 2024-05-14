import { EffectComposer, RenderPass, Scene3D, THREE } from "enable3d";
import { Chunks } from "../repositories/chunks.js";
import { Settings } from "../settings/settings.js";
import { SceneManager } from "../common/sceneman.js";
import { ResourceMap } from "../repositories/resources.js";
import { PlayerInfo } from "../repositories/player.js";
import { Entities } from "../repositories/entities.js";
import { ping } from "../socket/socket.js";
import { Utils } from "../modules/utils.js";
import { CameraManager } from "../controls/camera.js";
import { Controls } from "../controls/controls.js";
import UI from "../ui/uiman.js";
import { Lights } from "./lights.js";
import { Items } from "../repositories/items.js";
import { ItemData } from "../../../server/models/item.js";
import { Item } from "../models/item.js";
import { UnrealBloomPass } from "../lib/UnrealBloomPass.ts";
import { RenderPixelatedPass } from "../lib/RenderPixelatedPass.ts";
// import { xyz } from "../common/xyz.js";

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
		const { lights } = await this.warpSpeed('camera', 'light');

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

		player.emit('flags');

		CameraManager.setCamera(this.camera);
		UI.init();
		Controls.initControls(this.canvas);

		var supportsDepthTextureExtension = !!this.renderer.extensions.get(
			"WEBGL_depth_texture"
		);

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

		// this.physics.debug?.enable();
		this.composer = new EffectComposer(this.renderer);
		let r = new RenderPass(this.scene, this.camera);
		this.composer.addPass(r);
		this.composer.addPass(new RenderPixelatedPass(2, this.scene, this.camera) as any);
		this.composer.addPass(new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 0.5, 0.4) as any);
		// this.composer.addPass(new OutputPass());
	}

	resize(){
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	update(){

		Entities.update();
		Controls.update();
		UI.update();

		Chunks.loop(this.clock);

	}

}
