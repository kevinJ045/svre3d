import { Random } from "./common/rand";
import { variants } from "./constant/player_variant";
import { worldData } from "./constant/world";
import { loadAllResources } from "./functions/resources";
import { LoginManager } from "./login/login";
import { startPing } from "./ping/ping";
import { Sockets } from "./ping/sockets";
import { Biomes } from "./repositories/biomes";
import { Chunks } from "./repositories/chunks";
import { Entities } from "./repositories/entities";
import { Items } from "./repositories/items";
import { Mainloop } from "./repositories/mainloop";
import { Players } from "./repositories/players";
import { ResourceMap } from "./repositories/resources";


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