import { Random } from "../common/rand.js";
import { noise, seedrng } from "../constant/seed.js";
import { Data } from "../db/db.js";
import { ResourceSchema } from "../lib/loader/Schema.type.ts";
import { ChunkData } from "../models/chunk.js";
import { ServerData } from "../models/data.js";
import { jsonres } from "../models/jsonres.js";
import { StructureData, StructureRule } from "../models/structure.js";
import { ResourceMap } from "./resources.js";



export class Structures {


	static async constructStructure(chunk: ChunkData){
		const biome: ResourceSchema = chunk.biome.reference ? chunk.biome.reference : chunk.biome;

		if(biome.structures){

			const rule: StructureRule = Random.pick(...biome.structures, seedrng);

			const density = rule.density;
	
			const randomThreshold = Random.from(0, density, seedrng);

			const above = rule.above ? chunk.position.y >= rule.above : (rule.random ? true : false);
			const under = rule.under ? chunk.position.y <= rule.under : (rule.random ? true : false);

			const randomPlacement = randomThreshold == Math.floor(density / 2);

			const shouldPlaceStructure =  rule.random ? (randomPlacement && (above || under)) : ( above || under ); // Adjust threshold as needed

			console.log(shouldPlaceStructure);

			if (shouldPlaceStructure) {

				// Add the structure to the chunk
				const structure = ServerData.create(StructureData, {
					rule,
					biome
				});

				if(rule.loot){
					const looted = await Data.collection('loots')
					.findOne({
						name: rule.name,
						position: chunk.position
					});
					if(looted){
						structure.looted = true;
					}
				}

				chunk.structures.push(structure);
			}

		} 

	}

	static selectDropsByChance(drops: typeof StructureData.prototype.rule.drops, numSelections) {
		let totalChance = 0;
		for (const drop of drops!) {
			totalChance += drop.chance || 1; 
		}
	
		const selectedItems: typeof drops = [];
	
		for (let i = 0; i < numSelections; i++) {
			const randomNumber = Math.random() * totalChance;
	
			let cumulativeChance = 0;
			for (const drop of drops!) {
				cumulativeChance += drop.chance || 1;
				if (randomNumber <= cumulativeChance) {
					selectedItems.push(drop);
					break;
				}
			}
		}

		return selectedItems;
	}

}