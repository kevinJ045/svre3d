export class Sockets {
    static setIO(io) {
        this.io = io;
    }
    static emit(ev, ...args) {
        this.io.emit(ev, ...args);
    }
    static find(username) {
        return Object.values(Object.fromEntries(this.io.sockets.sockets.entries())).find(i => i.data.username == username);
    }
    static id(id) {
        return this.io.sockets.sockets.get('id');
    }
}
