import { item } from "./models/item";
import { Utils } from "./utils";

export const types = [
	'objects', 'textures', 'shaders', 'biomes'
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