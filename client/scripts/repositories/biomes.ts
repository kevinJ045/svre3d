import { Chunk } from "../models/chunk.js";
import { MaterialManager } from "./materials.js";
import { ResourceMap } from "./resources.js";



export class Biomes {

	static applyChunkBiome(chunk: Chunk){
		chunk.biome.biome.ground.texture = ResourceMap.find(chunk.biome.manifest.id)!.biome.ground.texture;
		const materials = 'mapping' in chunk.biome.biome.ground ? chunk.biome.biome.ground.mapping!.map(i => MaterialManager.makeSegmentMaterial((chunk.biome as any).biome.ground.texture.resource.load[i], chunk.biome.biome)) : MaterialManager.makeSegmentMaterial(chunk.biome.biome.ground.texture.resource.load, chunk.biome.biome);
		(chunk.object3d as any).material = materials;
	}

	static find(name){
		return ResourceMap
			.resources
			.filter(
				i => i.manifest.type == 'biome'
			)
			.find(
				i => i.manifest.id == 'i:'+name
			);
	}


}