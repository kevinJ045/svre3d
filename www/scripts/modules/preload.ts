import { Scene3D, THREE } from "enable3d";
import { toload } from "./loader";
import { CustomScene } from "./models/scene";
import { specific_load } from "./specific_load";
import { Utils } from "./utils";
import { OBJLoader } from "../lib/OBJLoader";

const loaders = {
	obj: async (url: string) => {
		const loader = new OBJLoader(new THREE.LoadingManager);
		return new Promise((r) => {
			loader.load(url, (item) => {
				r(item);
			}, null, null);
		});
	}
}

export const preload = async (scene: CustomScene) => {

	const loads = await toload();

	for(let undefinedItem of loads){
		let load: any = null;

		const item = {...undefinedItem};

		// console.log(undefinedItem.id);

		if(item.resource){

			const type = item.resource.type;
			
			if(item.type.endsWith("_map")){
				load = [];
				for(let src of item.resource.sources!){
					load.push(await scene.load[type](src));
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

		const group = item.loader ? item.loader.group : item.type;

		if(item.type == "biome"){
			scene.loadedChunks.chunkTypes.push({
				...item,
				item: scene.findLoadedResource(item.item, 'textures')
			} as any);
		} else {
			if(!scene.loaded[group]) scene.loaded[group] = [];
			scene.loaded[group].push(item);
		}
	}

	// console.log(scene.loadedChunks.chunkTypes);

	scene.loadedChunks.chunkTypes = Utils.shuffleArray(scene.loadedChunks.chunkTypes, scene.loadedChunks.rng);

	
};