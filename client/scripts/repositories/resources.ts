import { Scene3D, THREE } from "enable3d";
import { jsonres } from "../common/jsonres";
import { OBJLoader } from "../lib/OBJLoader";
import { FontLoader } from "../lib/FontLoader";
import { Utils } from "../modules/utils";
import { ResourceSchema } from "../../../server/lib/loader/Schema.type";
import { getPropStr } from "../../../server/common/getpropstr";

const loaders = {
	obj: async (url: string) => {
		const loader = new OBJLoader(new THREE.LoadingManager);
		return new Promise((r, re) => {
			loader.load(url, (item) => {
				r(item);
			}, null, () => re(null));
		});
	},
	font: async (url: string) => {
		const fontLoader = new FontLoader(new THREE.LoadingManager);
		return new Promise((r, re) => {
			fontLoader.load(url, (item) => {
				r(item);
			}, null, () => re(null));
		});
	},
	texture: async (url: string) => {
		const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager);
		return new Promise((r, re) => {
			textureLoader.load(url, (item) => {
				r(item);
			}, () => re(null));
		});
	},
	image: async (url: string) => {
		return new Promise((r,re) => {
			const playerIcon = new Image();
			playerIcon.src = url;
			playerIcon.onload = () => {
				r(playerIcon);
			}
		});
	}
}


export const resource_types = [
	'objects', 'textures', 'shaders', 'biomes', 'particles'
];

export const resolvePath = (item: ResourceSchema, suffix = 'res') => {
	return '/resources/'+item.manifest.id.split(':').join('/')+'/'+suffix;
}

export const loadItem = async (item, scene, suffix = 'res', parent?: ResourceSchema) => {
	let load: any = null;
	const type = item.resource.loader;

	if(item.manifest.type.endsWith("_map")){
		load = [];
		for(let index in item.resource.sources!){
			load.push(await loaders[type](
				resolvePath(parent || item, suffix ? suffix+'.'+index : undefined)
			));
		}
	} else if(type in scene.load) {
		load = await ((scene.load[type])(resolvePath(parent || item, suffix ? suffix : undefined)));
	} else if(type in loaders){
		load = await ((loaders[type])(resolvePath(parent || item, suffix ? suffix : undefined)));
	}


	if(type == "texture") {
		item.texture = load;
	} else if(type == "gltf" || type == "obj" || type == "fbx") {
		item.resource.mesh = type == "gltf" ? load.scene : load;
	} else if(item.type == "shader"){
		item.id = item.id+'.shader';
		if(item.resource.sources){
			if(!item['vertex']) item['vertex'] = await Utils.loadText(item.resource.sources![0]);
			if(!item['fragment']) item['fragment'] = await Utils.loadText(item.resource.sources![1]);
		}
	}

	item.resource.load = load;
}

export class ResourceMap {

	static resources: ResourceSchema[] = [];
	static queue: ResourceSchema[] = [];

	static async loadAll(scene: Scene3D){

		for(let undefinedItem of ResourceMap.queue){
			

			const item = {...undefinedItem};


			if(item.resource){
				if(item.resource.preload){
					for(let i of item.resource.preload){
						let [name, fetchName] = i.match(':') ? i.split(':') : [i, i];
						await loadItem(getPropStr(item, name), scene, 'res?prop='+fetchName, item);
					}
				} else {
					await loadItem(item, scene);
				}
			}

			ResourceMap.resources.push(item);
			// ResourceMap.queue.splice(ResourceMap.queue.indexOf(undefinedItem), 1);
		}
		while(ResourceMap.queue.length) ResourceMap.queue.pop();
	}

	static find(id: string, type?:string){
		return ResourceMap.resources.find(i => i.manifest?.id == id && (type ? i.type == type : true));
	}

}