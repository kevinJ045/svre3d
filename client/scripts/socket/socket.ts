

import sio from "socket.io-client";
import { initScene } from "../scene/init";
import { ResourceMap } from "../repositories/resources";
import { PlayerInfo } from "../repositories/player";
import { Entities } from "../repositories/entities";
import { Seed } from "../world/seed";
import { WorldData } from "../world/data";
const io = (window as any).io as typeof sio;

let S!: any;

export function ping<T = any, D = any>(action: string, data: D){
	return new Promise((r) => {
		S.emit(action, data, (response: T) => {
			r(response);
		});
	});
}

export function pingFrom<T = any, D = any>(action: string, func: (data: T) => any){
	S.on(action, async (data: T) => {
		await func(data);
	});
}


export async function connectSocket(){
	const token = "u";

	let reconnect = false;

	const socket = io('/', {
		auth: { token },
		query: { reconnect }
	});

	socket.on('reconnect', () => {
		reconnect = true;
	})

	socket.on('recognize', ({
		player,
		resources,
		playerEntity,
		worldData
	}) => {

		if(PlayerInfo.player.username) return;

		PlayerInfo.setPlayer(player);
		PlayerInfo.setPlayerEntity(playerEntity);
		ResourceMap.queue.push(...resources);

		Seed.setSeed(worldData.seed);
		WorldData.setData(worldData);
		
		S = socket;

		initScene();

	});

	socket.on('disconnect', () => {
		reconnect = true;
	});
}