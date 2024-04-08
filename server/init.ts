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

		const player = await Players.find(serverData.users[token])!;
		
		const playerEntity = Entities.spawn('m:player', player!.position, player!.username, player?.variant, player?.inventory);
		console.log(Entities.entities.length);

		socket.emit('recognize', {
			player,
			playerEntity,
			resources: ResourceMap.resources.map(f => f.data)
		});

		startPing(serverData, socket);

		socket.on('disconnect', () => {
			Entities.despawn(playerEntity!);
			console.log(Entities.entities.length);
		})

	} else {



	}

}

export function init(serverData: any){
	loadAllResources(ResourceMap);
	Items.filterItems();
	Biomes.registerBiomes();
}