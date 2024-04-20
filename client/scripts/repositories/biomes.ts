import { Chunk } from "../models/chunk";
import { MaterialManager } from "./materials";
import { ResourceMap } from "./resources";



export class Biomes {

	static applyChunkBiome(chunk: Chunk){
		if(typeof chunk.biome.item !== "object") chunk.biome.item = ResourceMap.find(chunk.biome.item);
		const materials = 'textures' in chunk.biome ? chunk.biome.textures!.map(i => MaterialManager.makeSegmentMaterial((chunk.biome as any).item.texture[i], chunk.biome)) : MaterialManager.makeSegmentMaterial((chunk.biome as any).item.texture, chunk.biome);
		(chunk.object3d as any).material = materials;
	}

	static find(name){
		return ResourceMap
			.resources
			.filter(
				i => i.type == 'biome'
			)
			.find(
				i => i.name == name
			);
	}


}