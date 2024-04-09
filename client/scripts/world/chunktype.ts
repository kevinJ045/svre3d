import { WorldData } from "./data";



export function getChunkType(noiseValue){
	const types = WorldData.get('biomeColors');


	const index = Math.min(Math.abs(Math.floor(noiseValue * types.length-1)), types.length-1);

	return types[index];
}
