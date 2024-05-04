import { item } from "./models/item.js";
import { Utils } from "./utils.js";

export const types = [
	'objects', 'textures', 'shaders', 'biomes', 'particles'
];

export const toload = async () : Promise<item[]> => {
	const data: any[] = [];

	for(let i of types){
		const objects = await Utils.dirToJson('json/'+i);
		for(let object of objects){
			data.push(object)
		}
	}

	return data;
}