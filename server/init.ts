import { Random } from "./common/rand.js";
import { variants } from "./constant/player_variant.js";
import { worldData } from "./constant/world.js";
import { loadAllResources } from "./functions/resources.js";
import { LoginManager } from "./login/login.js";
import { ServerData } from "./models/data.js";
import { startPing } from "./ping/ping.js";
import { Sockets } from "./ping/sockets.js";
import { Biomes } from "./repositories/biomes.js";
import { Chunks } from "./repositories/chunks.js";
import { Entities } from "./repositories/entities.js";
import { Items } from "./repositories/items.js";
import { Mainloop } from "./repositories/mainloop.js";
import { Players } from "./repositories/players.js";
import Projectiles from "./repositories/projectiles.js";
import { ResourceMap } from "./repositories/resources.js";


export async function userConnected(serverData, socket) {

	const token = socket.handshake.auth.token;

	const username = token && token !== 'null' ? await LoginManager.verifyToken(token) : null;

	if (username) {

		const player = await Players.find(username)!;

		// console.log(player);

		socket.data.username == username;

		const playerEntity = Entities.spawn('i:player', player!.position, player!.username, player?.variant, player?.inventory, { spawnPoint: player!.spawnPoint, username, color: player?.color, equipment: player?.equipment }, player!.exp)!;

		if (
			!Entities.entities.find(i => i.data.username == username) || socket.handshake.query.reconnect != 'true'
		) socket.emit('recognize', {
			player,
			playerEntity,
			resources: ResourceMap.all(),
			worldData: {
				...worldData,
				biomeColors: Biomes.biomes.map(i => i.reference.biome.colors)
			}
		});

		startPing(serverData, socket);

		serverData.emit('connect', { username, playerEntity });

		// setTimeout(() => Entities.spawn('m:goober', { x: 0, y: 0, z: 5 }, 'anji', 'lava', [], { ai: true }), 5000);
		// setTimeout(() => Entities.spawn('m:goober', { x: 0, y: 0, z: -5 }, 'jani', 'grass', [], { ai: true }), 5000);
		// setTimeout(() => Entities.spawnItem(Items.create('m:rubidium')!, { x: 0, y: 0, z: 2 }), 5000);

		socket.on('disconnect', () => {
			Entities.despawn(playerEntity!);
			serverData.emit('disconnect', { username, playerEntity });
		})

	} else {
		socket.emit('unrecognized', { biomes: Biomes.biomes.map(i => i.reference) });

		socket.on('register', async ({ variant, username, password, email }, cb) => {
			if (!variants.includes(variant)) return cb(null);
			await LoginManager.register(
				username,
				password,
				variant,
				email,
				Chunks.findSafeSpawnPoint(variant) || { x: 0, z: 0 }
			);
			cb(true);
		});

		socket.on('login', async ({ username, password }, cb) => {

			const user = await Players.find(username);

			if (!user) return cb()

			const token = await LoginManager.login(username, password);

			cb(token || 'wrong');
		});
	}

}

export function init(serverData: ServerData) {
	loadAllResources(ResourceMap, serverData);
	Items.filterItems();
	Biomes.registerBiomes();


	Mainloop.register(() => {
		Entities.update();
		Projectiles.moveProjectiles(Entities.entities);
	});

	Mainloop.start();
	serverData.emit('ready');

	// console.log(Chunks.findSafeSpawnPoint('i:swamp'));
}
