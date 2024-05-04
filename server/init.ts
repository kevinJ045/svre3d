import { Random } from "./common/rand.ts";
import { variants } from "./constant/player_variant.ts";
import { worldData } from "./constant/world.ts";
import { loadAllResources } from "./functions/resources.ts";
import { LoginManager } from "./login/login.ts";
import { startPing } from "./ping/ping.ts";
import { Sockets } from "./ping/sockets.ts";
import { Biomes } from "./repositories/biomes.ts";
import { Chunks } from "./repositories/chunks.ts";
import { Entities } from "./repositories/entities.ts";
import { Items } from "./repositories/items.ts";
import { Mainloop } from "./repositories/mainloop.ts";
import { Players } from "./repositories/players.ts";
import { ResourceMap } from "./repositories/resources.ts";


export async function userConnected(serverData, socket){

	const token = socket.handshake.auth.token;

	const username = token && token !== 'null' ? await LoginManager.verifyToken(token) : null;

	if(username){

		const player = await Players.find(username)!;

		// console.log(player);

		socket.data.username == username;

		const playerEntity = Entities.spawn('i:player', player!.position, player!.username, player?.variant, player?.inventory, { spawnPoint: player!.spawnPoint, username, color: player?.color, equipment: player?.equipment }, player!.exp)!;

		if(
			!Entities.entities.find(i => i.data.username == username) || socket.handshake.query.reconnect != 'true'
		) socket.emit('recognize', {
			player,
			playerEntity,
			resources: ResourceMap.all(),
			worldData: {
				...worldData,
				biomeColors: Biomes.biomes.map(i => i.reference.colors)
			}
		});

		startPing(serverData, socket);

		// setTimeout(() => Entities.spawn('m:goober', { x: 0, y: 0, z: 5 }, 'anji', 'lava', [], { ai: true }), 5000);
		// setTimeout(() => Entities.spawn('m:goober', { x: 0, y: 0, z: -5 }, 'jani', 'grass', [], { ai: true }), 5000);
		// setTimeout(() => Entities.spawnItem(Items.create('m:rubidium')!, { x: 0, y: 0, z: 2 }), 5000);

		socket.on('disconnect', () => {
			Entities.despawn(playerEntity!);
		})

	} else {
		socket.emit('unrecognized');

		socket.on('login', async ({ username, password }, cb) => {

			const user = await Players.find(username);

			const variant = Random.pick(...variants);

			if(!user) await LoginManager.register(
				username,
				password,
				variant,
				Chunks.findSafeSpawnPoint(variant) || { x: 0, z: 0 }
			);

			const token = await LoginManager.login(username, password);
			
			cb(token);
		});
	}

}

export function init(serverData: any){
	loadAllResources(ResourceMap);
	Items.filterItems();
	Biomes.registerBiomes();


	Mainloop.register(() => {
		Entities.update();
	});


	Mainloop.start();
}