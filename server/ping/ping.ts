import { Socket } from "socket.io";
import { Chunks } from "../repositories/chunks.ts";
import { xyz } from "../models/misc.xyz.ts";
import { Entities } from "../repositories/entities.ts";
import { Items } from "../repositories/items.ts";
import { Players } from "../repositories/players.ts";

export function pingFrom<T = any, D = any>(socket: Socket, action: string, func: (data: T) => any){
	socket.on(action, async (data: T, callback: (data: D) => any) => {
		const response = await func(data)
		callback(response);
	});
}

export function ping<T = any, D = any>(socket: Socket, action: string, data: D){
	return new Promise((r) => {
		socket.emit(action, data, (response: T) => {
			r(response);
		});
	});
}

export function startPing(serverData, socket: Socket){

	Chunks.startPing(socket, serverData);
	Entities.startPing(socket, serverData);
	Items.startPing(socket);
	Players.startPing(socket);

}