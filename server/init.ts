import { worldData } from "./constant/world";
import { loadAllResources } from "./functions/resources";
import { startPing } from "./ping/ping";
import { Sockets } from "./ping/sockets";
import { Biomes } from "./repositories/biomes";
import { Entities } from "./repositories/entities";
import { Items } from "./repositories/items";
import { Players } from "./repositories/players";
import { ResourceMap } from "./repositories/resources";


export async function userConnected(serverData, socket){

	const token = socket.handshake.auth.token;
	
	if(!token) return;

	if(token in serverData.users){

		const username = serverData.users[token];

		const player = await Players.find(username)!;
		
		const playerEntity = Entities.spawn('m:player', player!.position, player!.username, player?.variant, player?.inventory, { username, equipment: player?.equipment })!;

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

		socket.on('disconnect', () => {
			Entities.despawn(playerEntity!);
		})

	} else {

		socket.emit('unrecognized');

	}

}

export function init(serverData: any){
	loadAllResources(ResourceMap);
	Items.filterItems();
	Biomes.registerBiomes();
}