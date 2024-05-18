import { Random } from "../common/rand.js";
import { noise, seedrng } from "../constant/seed.js";
import { Data } from "../db/db.js";
import { ResourceSchema } from "../lib/loader/Schema.type.ts";
import { ChunkData } from "../models/chunk.js";
import { ServerData } from "../models/data.js";
import { jsonres } from "../models/jsonres.js";
import { StructureData, StructureRule } from "../models/structure.js";
import { ResourceMap } from "./resources.js";
import { Vector3 } from "three";


export class Structures {

	static swarmChunks: {
		chunk: ChunkData,
		rule: StructureRule,
		swarm: number,
		swarmed: number
	}[] = [];

	static addChunkSwarming(chunk: ChunkData, rule: StructureRule){
		this.swarmChunks.push({
			chunk,
			rule,
			swarm: rule.swarm!,
			swarmed: rule.swarm!
		})
	};

	static checkSwarmArea(chunk: ChunkData){
		if(this.swarmChunks.length){
			const swarmChunk = this.swarmChunks[0].chunk;
			const swarmChunkPos = new Vector3(swarmChunk.position.x, swarmChunk.position.y, swarmChunk.position.z);
			const currentChunkPos = new Vector3(chunk.position.x, chunk.position.y, chunk.position.z);

			if(chunk.biome.manifest.id !== swarmChunk.biome.manifest.id) return false;

			const distance = swarmChunkPos.distanceTo(currentChunkPos) / chunk.chunkSize;

			let swarm_this = distance <= this.swarmChunks[0].swarm ? {
				rule: this.swarmChunks[0].rule,
				distance:  Math.floor(distance)
			} : false;

			if(swarm_this) this.swarmChunks[0].swarmed--;
			if(this.swarmChunks[0].swarmed <= 0) this.swarmChunks.shift();
			return swarm_this;
		} else {
			return false;
		}
	}

	static async constructStructure(chunk: ChunkData){
		const biome: ResourceSchema = chunk.biome.reference ? chunk.biome.reference : chunk.biome;

		if(biome.structures){
			
			let rule: StructureRule = Random.pick(...biome.structures.filter(i => !i.under && !i.above)
			.filter(rule => rule.flags ? !rule.flags.map((flag: string) => flag.startsWith('!') ? 
				!chunk.flags.includes(flag.replace('!', '')) :
				chunk.flags.includes(flag)
			).includes(false) : true), seedrng);

			let rule2 = (biome.structures as StructureRule[]).find(
				struct => {
					if(struct.random) return;
					else if(struct.above){
						return chunk.position.y >= struct.above!;
					} else if (struct.under){
						return chunk.position.y <= struct.under!;
					}
				}
			);

			if(rule2 && rule2.allowStructures){
				if(!rule2.allowStructures.includes(rule.name)){
					rule = rule2;
					rule2 = undefined;
				}
			}

			const density = rule.density;
	
			const randomThreshold = Random.from(0, density, seedrng);

			const above = rule.above ? chunk.position.y >= rule.above : (rule.random ? true : false);
			const under = rule.under ? chunk.position.y <= rule.under : (rule.random ? true : false);

			const randomPlacement = randomThreshold == Math.floor(density / 2);

			let shouldPlaceStructure =  rule.random ? (randomPlacement && (above || under)) : ( above || under ); // Adjust threshold as needed

			if(rule.random && rule.swarm){
				this.addChunkSwarming(chunk, rule);
			} else if(rule.random){
				const swarm = this.checkSwarmArea(chunk);

				if(swarm){
					rule = swarm.rule;
					shouldPlaceStructure = Random.from(0, swarm.distance, seedrng) == Math.round(swarm.distance / 2);
				}
			}

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
				if(rule.flags) chunk.flags.push(...rule.flags);
			}

			if(rule2){
				const structure = ServerData.create(StructureData, {
					rule: rule2,
					biome
				});
				chunk.structures.push(structure);

				if(rule2.flags) chunk.flags.push(...rule2.flags)
			}

			if(shouldPlaceStructure || rule2){
				chunk.flags.push('structure');
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