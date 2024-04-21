import { Random } from "../common/rand";
import { noise, seedrng } from "../constant/seed";
import { Data } from "../db/db";
import { ChunkData } from "../models/chunk";
import { ServerData } from "../models/data";
import { jsonres } from "../models/jsonres";
import { StructureData, StructureRule } from "../models/structure";
import { ResourceMap } from "./resources";



export class Structures {


	static async constructStructure(chunk: ChunkData){
		const biome: jsonres = chunk.biome.reference ? chunk.biome.reference : chunk.biome;

		if(biome.structure_rules){

			const rule: StructureRule = Random.pick(...biome.structure_rules, seedrng);

			const density = rule.density;
	
			const randomThreshold = Random.from(0, density, seedrng);

			const above = rule.above ? chunk.position.y >= rule.above : (rule.random ? true : false);
			const under = rule.under ? chunk.position.y <= rule.under : (rule.random ? true : false);

			const randomPlacement = randomThreshold == Math.floor(density / 2);

			const shouldPlaceStructure =  rule.random ? (randomPlacement && (above || under)) : ( above || under ); // Adjust threshold as needed

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