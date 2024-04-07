

import sio from "socket.io-client";
import { initScene } from "../scene/init";
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

	const socket = io('/', {
		auth: { token }
	});

	socket.on('recognize', (username) => {
		console.log('Name:', username)
		S = socket;

		initScene();

	});
}