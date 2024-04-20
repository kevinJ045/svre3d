import { Random } from "../../../server/common/rand";
import { WorldData } from "./data";
import { Seed } from "./seed";



export function getChunkType(x, z, scale, offset){
	const noiseValue = Seed.noise.perlin2((x + offset) * scale, (z + offset) * scale);
	const types = WorldData.get('biomeColors');

	const index = Math.min(Math.abs(Math.floor(noiseValue * types.length-1)), types.length-1);


	return Array.isArray(types[index]) ? Random.pick(...types[index], () => Math.abs(Seed.noise.simplex2(x, z))) : types[index];
}
