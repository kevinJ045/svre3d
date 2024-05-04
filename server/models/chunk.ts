import { stringifyChunkPosition } from "../common/chunk.ts";
import { worldData } from "../constant/world.ts";
import { ResourceSchema } from "../lib/loader/Schema.type.ts";
import { BiomeData } from "./biome.ts";
import { ServerData } from "./data.ts";
import { EntityData } from "./entity.ts";
import { jsonres } from "./jsonres.ts";
import { xyz } from "./misc.xyz.ts";
import { StructureData } from "./structure.ts";

export class ChunkData extends ServerData {
	// Chunk-specific properties
	terrainHeightMap: number[][]; // 2D array representing terrain height
	structures: StructureData[]; // List of structures in the chunk
	entities: EntityData[]; // List of entities in the chunk
	position: xyz;
	biome!: ResourceSchema;

	chunkSize: number; // Chunk Size

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
