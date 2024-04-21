
import * as socketIo from "socket.io";


export class Sockets {

	static io: socketIo.Server;

	static setIO(io: typeof Sockets.io){
		this.io = io;
	}

	static emit(ev: string, ...args){
		this.io.emit(ev, ...args);
	}

	static find(username: string){
		return Object.values(
			Object.fromEntries(this.io.sockets.sockets.entries())
		).find(i => i.data.username == username);
	}

	static id(id: string){
		return this.io.sockets.sockets.get('id');
	}

}