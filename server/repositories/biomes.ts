import { Utils } from "../../client/scripts/modules/utils";
import { noise, seedrng } from "../constant/seed";
import { BiomeData } from "../models/biome";
import { ResourceMap } from "./resources";


export class Biomes {

	static biomes: BiomeData[] = [];

	static registerBiomes(){
		Biomes.biomes = Utils.shuffleArray(ResourceMap.resources
		.filter(
			i => i.data.type == 'biome'
		)
		.map(i => new BiomeData().setReference(i.data)), seedrng);
	}

	static getBiome(x: number, z: number){

		const scale = 0.0001;
		const offset = 0;
		const noiseValue = noise.perlin2((x + offset) * scale, (z + offset) * scale);
		const index = Math.min(Math.abs(Math.floor(noiseValue * Biomes.biomes.length-1)), Biomes.biomes.length-1);

		return Biomes.biomes[index];
	}
	
}