import { stringifyChunkPosition } from "../common/chunk";
import { BiomeData } from "./biome";
import { ServerData } from "./data";
import { EntityData } from "./entity";
import { jsonres } from "./jsonres";
import { xyz } from "./misc.xyz";
import { StructureData } from "./structure";

export class ChunkData extends ServerData {
	// Chunk-specific properties
	terrainHeightMap: number[][]; // 2D array representing terrain height
	structures: StructureData[]; // List of structures in the chunk
	entities: EntityData[]; // List of entities in the chunk
	position: xyz;
	biome!: BiomeData | jsonres;

	chunkSize: number; // Chunk Size

	constructor() {
		super();
		this.terrainHeightMap = [[]]; // Initialize with an empty 2D array
		this.structures = [];
		this.entities = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.chunkSize = 5;
	}

	stringify(){
		return stringifyChunkPosition(this.position);
	}
}
