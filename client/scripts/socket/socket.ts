

import sio from "socket.io-client";
import { LocalDB } from "../localdb/localdb.js";
import { Login } from "../login/login.js";
const io = (window as any).io as typeof sio;

export let S!: any;

export function ping<T = any, D = any>(action: string, data: D) {
	return new Promise((r) => {
		S.emit(action, data, (response: T) => {
			r(response);
		});
	});
}

export function pingFrom<T = any, D = any>(action: string, func: (data: T) => any) {
	if (S) S.on(action, async (data: T) => {
		await func(data);
	});
}


export async function connectSocket(callback: (whatever: Record<string, any>) => void, login: () => void) {
	const token = LocalDB.cookie.get('token');

	let reconnect = false;

	const socket = io('/', {
		auth: { token },
		query: { reconnect }
	});
	S = socket;

	socket.on('reconnect', () => {
		reconnect = true;
	})

	socket.on('recognize', (whatever) => {
		callback(whatever);
	});

	socket.on('unrecognized', ({ biomes }) => {
		(window as any)._biomes = biomes;
		login();
	});

	socket.on('disconnect', () => {
		reconnect = true;
	});
}
