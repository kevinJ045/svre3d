import { Random } from "../common/rand.js";
import { noise, seedrng } from "../constant/seed.js";
import { BiomeData } from "../models/biome.js";
import { ResourceMap } from "./resources.js";


export class Biomes {

	static biomes: BiomeData[] = [];

	static registerBiomes(){
		Biomes.biomes = Random.shuffleArray(ResourceMap.all()
		.filter(
			i => i.manifest.type == 'biome'
		)
		.map(i => new BiomeData().setReference(i)), seedrng);
	}

	static getBiome(x: number, z: number, flags: string[]){

		const scale = 0.0001;
		const offset = 0;
		const noiseValue = noise.perlin2((x + offset) * scale, (z + offset) * scale);
		const index = Math.min(Math.abs(Math.floor(noiseValue * Biomes.biomes.length-1)), Biomes.biomes.length-1);

		const biome = {...Biomes.biomes[index], reference: {
			...Biomes.biomes[index].reference,
		}};
		biome.flags = [];

		if(biome.reference.biome.tile?.multicolor){
			const colors = [...biome.reference.biome.colors];
			if(biome.reference.biome.tile.keepdefault) colors.unshift('none');
			const color = Random.pick(...colors, () => Math.abs(noise.perlin2(x * 0.01, z * 0.01)));
			biome.reference.biome.tile.variation_color = color;
			flags.push(`color_${colors.indexOf(color)}`);
		}

		if(Array.isArray(biome.reference.item)) {
			biome.reference.item = Random.pick(...biome.reference.item, () => Math.abs(noise.simplex2(x * 0.01, z * 0.01)));
		}

		if(biome.reference.biome?.ground?.substitutes && biome.reference.biome.ground.mapping){
			const substitutes = biome.reference.biome?.ground?.substitutes;
			const substitute = Random.pick(...substitutes.filter(i => i.chance ? (
				seedrng() > i.chance
			) : true), () => Math.abs(noise.simplex2(x * 0.01, z * 0.01)));
			biome.reference.biome.ground.mapping = biome.reference.biome?.ground.mapping
				.join(',')
				.replaceAll(substitute.replace[0][0], substitute.replace[1][0])
				.replaceAll(substitute.replace[0][1], substitute.replace[1][1])
				.split(',');
			if(Array.isArray(substitute.flags)) biome.flags.push(...substitute.flags);

			if(substitute.variation_color) biome.reference.biome.tile.variation_color = substitute.variation_color;
		}

		if(biome.flags.includes('no_variation')){
			delete biome.reference.biome.tile.variation_color;
		}

		return biome;
	}
	
}