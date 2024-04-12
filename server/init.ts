import { Random } from "./common/rand";
import { variants } from "./constant/player_variant";
import { worldData } from "./constant/world";
import { loadAllResources } from "./functions/resources";
import { LoginManager } from "./login/login";
import { startPing } from "./ping/ping";
import { Sockets } from "./ping/sockets";
import { Biomes } from "./repositories/biomes";
import { Entities } from "./repositories/entities";
import { Items } from "./repositories/items";
import { Mainloop } from "./repositories/mainloop";
import { Players } from "./repositories/players";
import { ResourceMap } from "./repositories/resources";


export async function userConnected(serverData, socket){

	const token = socket.handshake.auth.token;

	const username = token ? await LoginManager.verifyToken(token) : null;

	if(username){

		const player = await Players.find(username)!;

		// console.log(player);

		const playerEntity = Entities.spawn('m:player', player!.position, player!.username, player?.variant, player?.inventory, { username, equipment: player?.equipment }, player!.exp)!;

		if(
			!Entities.entities.find(i => i.data.username == username) || socket.handshake.query.reconnect != 'true'
		) socket.emit('recognize', {
			player,
			playerEntity,
			resources: ResourceMap.resources.map(f => f.data),
			worldData: {
				...worldData,
				biomeColors: Biomes.biomes.map(i => i.reference.map.color)
			}
		});

		startPing(serverData, socket);

		// setTimeout(() => Entities.spawn('m:goober', { x: 0, y: 0, z:0 }), 5000);

		socket.on('disconnect', () => {
			Entities.despawn(playerEntity!);
		})

	} else {
		socket.emit('unrecognized');

		socket.on('login', async ({ username, password }, cb) => {

			const user = await Players.find(username);
			
			if(!user) await LoginManager.register(
				username,
				password,
				Random.pick(...variants)
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