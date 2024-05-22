import { stringifyChunkPosition } from "../common/chunk.js";
import { worldData } from "../constant/world.js";
import { ServerData } from "./data.js";
export class ChunkData extends ServerData {
    constructor() {
        super();
        this.data = {};
        this.flags = ['chunk'];
        this.terrainHeightMap = [[]]; // Initialize with an empty 2D array
        this.structures = [];
        this.entities = [];
        this.position = { x: 0, y: 0, z: 0 };
        this.chunkSize = worldData.chunkSize;
    }
    stringify() {
        return stringifyChunkPosition(this.position);
    }
}
