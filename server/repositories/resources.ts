import Package from "../lib/loader/Package.class";
import { ResourceSchema } from "../lib/loader/Schema.type";
import { jsonres } from "../models/jsonres";


export class ResourceMap {

	static resources: Package[] = [];

	static addPackage(pkg: Package){
		ResourceMap.resources.push(pkg);
	}

	static findResource(id: string, type?:string){
		return ResourceMap.resources.find(i => i.findById(id))?.findById(id);
	}

	static all(){
		const res: ResourceSchema[] = [];
		this.resources.forEach(i => res.push(...i.data));
		return res;
	}

}