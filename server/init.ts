import { loadAllResources } from "./functions/resources";
import { startPing } from "./ping/ping";
import { ResourceMap } from "./repositories/resources";


export function userConnected(serverData, socket){

	const token = socket.handshake.auth.token;
	
	if(!token) return;

	if(token in serverData.users){
		
		socket.emit('recognize', serverData.users[token]);

		startPing(serverData, socket);

	} else {



	}

}

export function init(serverData: any){
	loadAllResources(ResourceMap);
}