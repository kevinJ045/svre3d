import { stringifyChunkPosition } from "../common/chunk";
import { ServerData } from "./data";
import { EntityData } from "./entity";
import { xyz } from "./misc.xyz";
import { StructureData } from "./structure";

export class ChunkData extends ServerData {
	// Chunk-specific properties
	terrainHeightMap: number[][]; // 2D array representing terrain height
	biomeType: string; // Type of biome in the chunk
	structures: StructureData[]; // List of structures in the chunk
	entities: EntityData[]; // List of entities in the chunk
	position: xyz;

	chunkSize: number; // Chunk Size

	constructor() {
		super();
		this.terrainHeightMap = [[]]; // Initialize with an empty 2D array
		this.biomeType = "";
		this.structures = [];
		this.entities = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.chunkSize = 5;
	}

	stringify(){
		return stringifyChunkPosition(this.position);
	}
}
