import { initScene } from "../scene/init.js";
import { ResourceMap } from "../repositories/resources.js";
import { PlayerInfo } from "../repositories/player.js";
import { Seed } from "../world/seed.js";
import { WorldData } from "../world/data.js";
import { LocalDB } from "../localdb/localdb.js";
import { Login } from "../login/login.js";
const io = window.io;
let S;
export function ping(action, data) {
    return new Promise((r) => {
        S.emit(action, data, (response) => {
            r(response);
        });
    });
}
export function pingFrom(action, func) {
    if (S)
        S.on(action, async (data) => {
            await func(data);
        });
}
export async function connectSocket() {
    const token = LocalDB.cookie.get('token');
    let reconnect = false;
    const socket = io('/', {
        auth: { token },
        query: { reconnect }
    });
    socket.on('reconnect', () => {
        reconnect = true;
    });
    socket.on('recognize', ({ player, resources, playerEntity, worldData }) => {
        if (PlayerInfo.player.username)
            return;
        PlayerInfo.setPlayer(player);
        PlayerInfo.setPlayerEntity(playerEntity);
        ResourceMap.queue.push(...resources);
        Seed.setSeed(worldData.seed);
        WorldData.setData(worldData);
        S = socket;
        initScene();
    });
    socket.on('unrecognized', ({ biomes }) => {
        Login.init(socket, biomes);
    });
    socket.on('disconnect', () => {
        reconnect = true;
    });
}
