import { ChunkData } from "../models/chunk.ts";
import { EntityData } from "../models/entity.ts";
import { BiomeData } from "../models/biome.ts";
import { Random } from "../common/rand.ts";
import { jsonres } from "../models/jsonres.ts";
import { Entities } from "./entities.ts";

export class EntitySpawner {

  static spawnAtChunk(chunk: ChunkData){

		const biome: jsonres = chunk.biome.reference ? chunk.biome.reference : chunk.biome;

		if(biome.spawn_rules){

			const rule = Random.pick(...biome.spawn_rules);

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