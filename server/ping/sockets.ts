
import * as socketIo from "socket.io";


export class Sockets {

	static io: socketIo.Server;

	static setIO(io: typeof Sockets.io){
		this.io = io;
	}

	static emit(ev: string, ...args){
		this.io.emit(ev, ...args);
	}

}