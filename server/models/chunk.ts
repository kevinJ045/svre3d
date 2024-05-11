import { stringifyChunkPosition } from "../common/chunk.js";
import { worldData } from "../constant/world.js";
import { ResourceSchema } from "../lib/loader/Schema.type.js";
import { BiomeData } from "./biome.js";
import { ServerData } from "./data.js";
import { EntityData } from "./entity.js";
import { jsonres } from "./jsonres.js";
import { xyz } from "./misc.xyz.js";
import { StructureData } from "./structure.js";

export class ChunkData extends ServerData {
	// Chunk-specific properties
	terrainHeightMap: number[][]; // 2D array representing terrain height
	structures: StructureData[]; // List of structures in the chunk
	entities: EntityData[]; // List of entities in the chunk
	position: xyz;
	biome!: ResourceSchema;

	chunkSize: number; // Chunk Size

	data: any = {};

	constructor() {
		super();
		this.terrainHeightMap = [[]]; // Initialize with an empty 2D array
		this.structures = [];
		this.entities = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.chunkSize = worldData.chunkSize;
	}

	stringify(){
		return stringifyChunkPosition(this.position);
	}
}
