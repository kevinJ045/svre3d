import { Chunks } from "../repositories/chunks.js";
import { Entities } from "../repositories/entities.js";
import { Items } from "../repositories/items.js";
import { Players } from "../repositories/players.js";
import { Chats } from "../repositories/chats.js";
import Projectiles from "../repositories/projectiles.js";
export function pingFrom(socket, action, func) {
    socket.on(action, async (data, callback) => {
        const response = await func(data);
        callback(response);
    });
}
export function ping(socket, action, data) {
    return new Promise((r) => {
        socket.emit(action, data, (response) => {
            r(response);
        });
    });
}
export function startPing(serverData, socket) {
    Chunks.startPing(socket, serverData);
    Entities.startPing(socket, serverData);
    Items.startPing(socket);
    Players.startPing(socket);
    Chats.startPing(socket);
    Projectiles.startPing(socket, Entities.entities);
}
