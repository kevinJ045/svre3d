import { Random } from "../common/rand";
import { noise, seedrng } from "../constant/seed";
import { BiomeData } from "../models/biome";
import { ResourceMap } from "./resources";


export class Biomes {

	static biomes: BiomeData[] = [];

	static registerBiomes(){
		Biomes.biomes = Random.shuffleArray(ResourceMap.all()
		.filter(
			i => i.manifest.type == 'biome'
		)
		.map(i => new BiomeData().setReference(i)), seedrng);
	}

	static getBiome(x: number, z: number){

		const scale = 0.0001;
		const offset = 0;
		const noiseValue = noise.perlin2((x + offset) * scale, (z + offset) * scale);
		const index = Math.min(Math.abs(Math.floor(noiseValue * Biomes.biomes.length-1)), Biomes.biomes.length-1);

		const biome = {...Biomes.biomes[index], reference: {
			...Biomes.biomes[index].reference
		}};

		if(biome.reference.tile?.multicolor){
			const colors = [...biome.reference.colors];
			if(biome.reference.tile.keepdefault) colors.unshift('none');
			biome.reference.tile_variation_color = Random.pick(...colors, () => Math.abs(noise.simplex2(x * 0.01, z * 0.01)));
		}

		if(Array.isArray(biome.reference.item)) {
			biome.reference.item = Random.pick(...biome.reference.item, () => Math.abs(noise.simplex2(x * 0.01, z * 0.01)));
		}


		return biome;
	}
	
}