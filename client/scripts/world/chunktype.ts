import { Random } from "../../../server/common/rand.js";
import { WorldData } from "./data.js";
import { Seed } from "./seed.js";


let l = 0;
export function getChunkType(x, z, scale, offset, items?: any[]){
	
	const noiseValue = Seed.noise.perlin2((x + offset) * scale, (z + offset) * scale);
	const types = items || WorldData.get('biomeColors');

	// console.log(types.length);

	const index = Math.min(Math.abs(Math.floor(noiseValue * types.length-1)), types.length-1);

	return Array.isArray(types[index]) ? Random.pick(...types[index], () => Math.abs(Seed.noise.simplex2(x * scale, z * scale))) : types[index];
}
