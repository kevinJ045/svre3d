import { Scene3D } from "enable3d";
import { toload } from "./loader";
import { CustomScene } from "./models/scene";
import { specific_load } from "./specific_load";
import { Utils } from "./utils";


export const preload = async (scene: CustomScene) => {

	const loads = await toload();

	for(let undefinedItem of loads){
		let load: any = null;

		const item = {...undefinedItem};

		if(item.resource){

			const type = item.resource.type;
			
			if(item.type.endsWith("_map")){
				load = [];
				for(let src of item.resource.sources!){
					load.push(await scene.load[type](src));
				}
			} else if(type in scene.load) {
				load = (await scene.load[type](item.resource.src));
			}


			if(type == "texture") {
				item.texture = load;
			} else if(type == "gltf" || type == "object" || type == "fbx") {
				item.mesh = type == "gltf" ? load.scene : load;
			} else if(item.type == "shader"){
				item.id = item.id+'.shader';
				item['vertex'] = await Utils.loadText(item.resource.sources![0]);
				item['fragment'] = await Utils.loadText(item.resource.sources![1]);
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

	console.log(scene.loaded);

	
};