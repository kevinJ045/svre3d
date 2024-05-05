import { ChunkData } from "../models/chunk.js";
import { EntityData } from "../models/entity.js";
import { BiomeData } from "../models/biome.js";
import { Random } from "../common/rand.js";
import { jsonres } from "../models/jsonres.js";
import { Entities } from "./entities.js";
import { ResourceSchema } from "../lib/loader/Schema.type.ts";

export class EntitySpawner {

  static spawnAtChunk(chunk: ChunkData){

		const biome: ResourceSchema = chunk.biome.reference ? chunk.biome.reference : chunk.biome;

		if(biome.spawn){

			const rule = Random.pick(...biome.spawn);

			const rarity = rule.rarity;
	
			const randomThreshold = Random.from(0, rarity);

			const randomPlacement = randomThreshold == Math.floor(rarity / 2);

			if(randomPlacement){

				Entities.spawn(
					rule.entity,
					{
						x: chunk.position.x,
						y: chunk.position.y + 1,
						z: chunk.position.z,
					},
					"",
					rule.variant
				);

			}

		}

	}
	
}
