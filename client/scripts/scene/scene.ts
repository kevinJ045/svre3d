import { EffectComposer, Scene3D, THREE } from "enable3d";
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
import EffectManager from "../repositories/effects.js";
import { UnrealBloomPass } from "../lib/UnrealBloomPass.js";
// import { xyz } from "../common/xyz.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { Biomes } from "../repositories/biomes.js";
import Projectiles from "../repositories/projectiles.js";
import GlobalEmitter from "../misc/globalEmitter.js";
import Markers from "../objects/markers.js";
import { ShaderStructure } from "../objects/shaderObject.js";
import Stats from 'stats.js';

export class MainScene extends Scene3D {
	stats: Stats;

	constructor() {
		super({ key: 'MainScene' })
	}

	init() {
		this.renderer.setPixelRatio(1)
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		SceneManager.scene = this;

    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom); // Attach stats to the DOM

	}

	preRender(){
		this.stats.begin();
	}

	postRender(){
		this.stats.end();
	}

	async preload() {
		await ResourceMap.loadAll(this);
	}

	async create() {
		const { lights } = await this.warpSpeed('camera', 'light');

		// this.scene.add(lights!.directionalLight)

		Lights
			.setLights(lights!)
			.initLights();

		console.log('Start');

		Chunks.init();
		const player = Entities.spawn(PlayerInfo.entity)!;
		PlayerInfo.setPlayerEntity(player);

		// this.camera.position.set(25, 25, 25);

		player.on('setTarget', (position) => {
			ping('entity:settarget', { entity: player.id, position });
		});

		// player.displace(new THREE.Vector3(Utils.randFrom(-10, 10), 0, Utils.randFrom(-10, 10)));
		Chunks.update(PlayerInfo.entity.object3d.position, Settings.get('performance.renderDistance'));
		let t: any = 0;
		let t2: any = 0
		player.on('move', () => {
			Lights.updateLightPosition(PlayerInfo.entity.object3d.position.clone());
			Chunks.update(PlayerInfo.entity.object3d.position, Settings.get('performance.renderDistance'));
			Biomes.updateSky(PlayerInfo.entity.object3d.position);
			GlobalEmitter.emit('player:move');

			clearTimeout(t);
			t = setTimeout(() => ping('player:position', { username: PlayerInfo.username, position: PlayerInfo.entity.object3d.position }), 2500);
			ping('entities:getspawned', {
				position: player.object3d.position,
				distance: Settings.get('performance.renderDistance'),
				id: player.id
			});
			EffectManager.fog_update(this, player.object3d.position.distanceTo(this.camera.position));
			Entities.updateEntities(player.object3d.position, Settings.get<number>('performance.renderDistance'));
			// clearTimeout(t2);
			// t2 = setTimeout(() => {
			// 	Chunks.renderCloseAndFar(player.object3d.position, Settings.get('performance.renderDistance'), Settings.get('performance.detailsLimit'));
			// }, 10);
		});
		GlobalEmitter.on('chunk:loaded', () => {
			clearTimeout(t2);
			t2 = setTimeout(() => {
				Chunks.renderCloseAndFar(player.object3d.position, Settings.get('performance.renderDistance'), Settings.get('performance.detailsLimit'));
			}, 10);
		});

		Settings.on('change:performance.renderDistance', () => player.emit('move'));

		ping('entities:getspawned', {
			position: player.object3d.position,
			distance: Settings.get('performance.renderDistance'),
			id: player.id
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
		Projectiles.ping();

		player.emit('flags');

		CameraManager.setCamera(this.camera);
		CameraManager.setCanvas(this.canvas);
		UI.init();
		Controls.initControls(this.canvas);

		Lights.updateLightPosition(PlayerInfo.entity.object3d.position.clone());

		// var supportsDepthTextureExtension = !!this.renderer.extensions.get(
		// 	"WEBGL_depth_texture"
		// );

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:horn-1',
		// 	quantity: 1
		// })));

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:rubidium',
		// 	quantity: 1
		// })));

		// setTimeout(() => {
		// 	ping('projectile:create', {
		// 		owner: player.id,
		// 		direction: { x: 0, y: 0, z: 1 },
		// 		speed: 0.1, damage: 1, objectId: 'i:rubidium',
		// 		maxDistance: 10
		// 	});
		// }, 10000);

		// player.addToInventory(Items.create(new ItemData().setData({
		// 	itemID: 'm:oreon',
		// 	quantity: 5
		// })));
		this.composer = new EffectComposer(this.renderer);
		EffectManager.init(this);
		EffectManager.initFog(this, player.object3d.position.distanceTo(this.camera.position));

		this.renderer.setClearAlpha(0);
		document.body.classList.add('sky');

		// Items.crafting(...player.inventory.slice(1, 3) as any);

		// this.physics.debug?.enable();

		// this.renderer.shadowMap = THREE.PCFShadowMap;



		// const shadowHelper = new THREE.CameraHelper( Lights.lights.directionalLight.shadow.camera )
		// this.scene.add(shadowHelper);


		window.addEventListener('resize', () => this.resize());

		setTimeout(() => {
			// ping('chat:send', {
			// 	message: '/summon ~ ~ ~ i:trader i:grass',
			// 	username: PlayerInfo.username
			// });
		}, 1000);
	}

	ssaoPass!: SSAOPass;
	unrealBloomPass!: UnrealBloomPass;
	composer2!: EffectComposer;

	resize() {
		this.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.composer.setSize(window.innerWidth, window.innerHeight);
		EffectManager.resize(this);
	}

	update(time) {

		Entities.update(time);
		Projectiles.update();
		Controls.update();
		UI.update();

		Chunks.loop(this.clock);
		Markers.update();

		if (this.composer2) {
			this.composer2.render();
		}

		// // Lights.lights.directionalLight.lookAt()
	}

}
