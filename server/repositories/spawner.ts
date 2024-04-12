import { ChunkData } from "../models/chunk";
import { EntityData } from "../models/entity";
import { BiomeData } from "../models/biome";
import { Random } from "../common/rand";
import { jsonres } from "../models/jsonres";
import { Entities } from "./entities";

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
