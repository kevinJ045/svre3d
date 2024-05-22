import { stringifyChunkPosition } from "../common/chunk.js";
import { SceneManager } from "../common/sceneman.js";
import { Chunk } from "../models/chunk.js";
import { makeChunk } from "../objects/chunk.js";
import { THREE } from "enable3d";
import { ping, pingFrom } from "../socket/socket.js";
import { PhysicsManager } from "../common/physics.js";
import { ServerData } from "../../../server/models/data.js";
import { Biomes } from "./biomes.js";
import { WorldData } from "../world/data.js";
import { Structures } from "./structures.js";
export class Chunks {
    static chunkFromData(chunk) {
        return ServerData.create(Chunk, chunk).setData({
            position: new THREE.Vector3(chunk.position.x, chunk.position.y, chunk.position.z),
            biome: chunk.biome
        });
    }
    static loadChunk(chunk) {
        const chunkObject = makeChunk(chunk.chunkSize);
        chunkObject.userData.info = {
            type: 'chunk',
            chunk
        };
        chunk.setMesh(chunkObject);
        Biomes.applyChunkBiome(chunk);
        chunkObject.position.set(chunk.position.x, chunk.position.y - 3, chunk.position.z);
        Structures.loadStrcuture(chunk);
        SceneManager.scene.scene.add(chunkObject);
        PhysicsManager.addPhysics(chunkObject, {
            shape: 'box',
            width: chunk.chunkSize,
            height: Math.floor(chunk.chunkSize / 2),
            depth: chunk.chunkSize,
            mass: 0,
        });
        this.chunks.push(chunk);
    }
    static chunkObjects() {
        return this.chunks.map(chunk => chunk.object3d);
    }
    static unloadChunk(chunk) {
        const key = chunk.stringify();
        const found = Chunks.find(key);
        if (found) {
            Chunks.delete(key);
        }
    }
    static clear() {
        this.chunks = [];
        return this;
    }
    static find(key) {
        return this.chunks.find(i => i.stringify() == key);
    }
    static at(index) {
        return this.chunks.at(index);
    }
    static index(found) {
        return this.chunks.indexOf(found);
    }
    static entries() {
        return [...this.chunks];
    }
    static has(key) {
        return this.find(key) ? true : false;
    }
    static delete(key) {
        const found = this.find(key);
        if (found) {
            SceneManager.scene.scene.remove(found.object3d);
            this.chunks.splice(this.index(found), 1);
        }
        return this;
    }
    static requestLoadChunk(position) {
        ping('chunk:request', { position, type: 'load' });
    }
    static requestUnloadChunk(position) {
        ping('chunk:request', { position, type: 'unload' });
    }
    static init() {
        pingFrom('chunk:load', (data) => {
            if (!Chunks.has(stringifyChunkPosition(data.position))) {
                Chunks.loadChunk(Chunks.chunkFromData(data));
                if (!Biomes.firstUpdate) {
                    Biomes.updateSky(data.position);
                    Biomes.firstUpdate = true;
                }
            }
            Chunks.loadRequests.splice(Chunks.loadRequests.indexOf(stringifyChunkPosition({ ...data.position, y: 0 })), 1);
        });
        pingFrom('chunk:unload', (data) => {
            Chunks.delete(stringifyChunkPosition(data));
            Chunks.unloadRequests.splice(Chunks.unloadRequests.indexOf(stringifyChunkPosition(data)), 1);
        });
        pingFrom('structure:loot', (data) => {
            const chunk = Chunks.find(data.chunk);
            if (!chunk)
                return;
            const structure = chunk.structures.find(i => i.id == data.structure);
            if (!structure)
                return;
            console.log(chunk, structure);
            structure.looted = true;
            chunk.object3d.traverse(o => chunk.object3d.remove(o));
            Structures.loadStrcuture(chunk);
        });
    }
    static findChunkAtPosition(position) {
        for (const chunk of this.chunks) {
            if (position.x >= chunk.object3d.position.x &&
                position.x < chunk.object3d.position.x + chunk.chunkSize &&
                position.z >= chunk.object3d.position.z &&
                position.z < chunk.object3d.position.z + chunk.chunkSize) {
                return chunk;
            }
        }
        return null;
    }
    static loop(clock) {
        var time = clock.getElapsedTime();
        this.chunks.forEach(chunk => {
            if (chunk.data.liquids) {
                chunk.data.liquids.forEach(liquid => {
                    liquid.material.uniforms.time.value = time;
                });
            }
        });
    }
    static update(playerPosition, renderDistance) {
        const chunkSize = WorldData.get('chunkSize');
        const playerChunkPosition = playerPosition.clone().divideScalar(chunkSize).floor();
        // Calculate the range of chunk coordinates around the player within the render distance
        const startX = Math.floor(playerChunkPosition.x - renderDistance);
        const endX = Math.ceil(playerChunkPosition.x + renderDistance);
        const startZ = Math.floor(playerChunkPosition.z - renderDistance);
        const endZ = Math.ceil(playerChunkPosition.z + renderDistance);
        const unloadStartX = Math.floor(playerChunkPosition.x - 1.1 * renderDistance);
        const unloadEndX = Math.ceil(playerChunkPosition.x + 1.1 * renderDistance);
        const unloadStartZ = Math.floor(playerChunkPosition.z - 1.1 * renderDistance);
        const unloadEndZ = Math.ceil(playerChunkPosition.z + 1.1 * renderDistance);
        // Unload chunks that are outside the range
        for (let i = Chunks.chunks.length - 1; i >= 0; i--) {
            const chunk = Chunks.chunks[i];
            const chunkPosition = chunk.position.clone().divideScalar(chunkSize).floor();
            // Check if the chunk is outside the range of loaded chunks
            if (!Chunks.unloadRequests.includes(stringifyChunkPosition(chunkPosition))) {
                if (chunkPosition.x < unloadStartX || chunkPosition.x > unloadEndX || chunkPosition.z < unloadStartZ || chunkPosition.z > unloadEndZ) {
                    Chunks.requestUnloadChunk(chunk.position);
                    Chunks.unloadRequests.push(stringifyChunkPosition(chunk.position));
                }
            }
        }
        // Load chunks within the range around the player
        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                // if(!Chunks.has(stringifyChunkPosition({ x, z })))
                const pos = new THREE.Vector3(x * chunkSize, 0, z * chunkSize);
                if (!Chunks.loadRequests.includes(stringifyChunkPosition(pos))) {
                    Chunks.requestLoadChunk(pos);
                    Chunks.loadRequests.push(stringifyChunkPosition(pos));
                }
            }
        }
    }
}
Chunks.chunks = [];
Chunks.unloadRequests = [];
Chunks.loadRequests = [];
