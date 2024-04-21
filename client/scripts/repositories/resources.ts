import { Scene3D, THREE } from "enable3d";
import { jsonres } from "../common/jsonres";
import { OBJLoader } from "../lib/OBJLoader";
import { FontLoader } from "../lib/FontLoader";
import { Utils } from "../modules/utils";

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


export class ResourceMap {

	static resources: jsonres[] = [];
	static queue: jsonres[] = [];

	static async loadAll(scene: Scene3D){

		for(let undefinedItem of ResourceMap.queue){
			let load: any = null;

			const item = {...undefinedItem};

			if(item.resource){

				const type = item.resource.type;
				
				if(item.type.endsWith("_map")){
					load = [];
					for(let src of item.resource.sources!){
						load.push(await loaders[type](src));
					}
				} else if(type in scene.load) {
					load = await ((scene.load[type])(item.resource.src));
				} else if(type in loaders){
					load = await ((loaders[type])(item.resource.src));
				}


				if(type == "texture") {
					item.texture = load;
				} else if(type == "gltf" || type == "obj" || type == "fbx") {
					item.mesh = type == "gltf" ? load.scene : load;
				} else if(item.type == "shader"){
					item.id = item.id+'.shader';
					if(item.resource.sources){
						if(!item['vertex']) item['vertex'] = await Utils.loadText(item.resource.sources![0]);
						if(!item['fragment']) item['fragment'] = await Utils.loadText(item.resource.sources![1]);
					}
				}

				item.load = load;
			}

			ResourceMap.resources.push(item as jsonres);
			// ResourceMap.queue.splice(ResourceMap.queue.indexOf(undefinedItem), 1);
		}
		while(ResourceMap.queue.length) ResourceMap.queue.pop();
	}

	static find(id: string, type?:string){
		return ResourceMap.resources.find(i => i.id == id && (type ? i.type == type : true));
	}

}