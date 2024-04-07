import { jsonres } from "../models/jsonres";


export class ResourceMap {

	static resources: {type: string, data: jsonres}[] = [];

	static loadJson(json: object, type: string){
		ResourceMap.resources.push({type, data: json as any});
	}

	static findResource(id: string, type?:string){
		return ResourceMap.resources.find(i => i.data.id == id && (type ? i.type == type : true));
	}

}