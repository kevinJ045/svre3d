import { Scene3D } from "enable3d";
import { toload } from "./loader";
import { CustomScene } from "./models/scene";
import { specific_load } from "./specific_load";


export const preload = async (scene: CustomScene) => {

	const loads = toload();

	for(let i in loads.objects){

		const item = loads.objects[i];

		const load = (await scene.load[item.resource.type](item.resource.src));

		const item_full = {
			mesh: item.resource.type == "gltf" ? load.scene : load,
			load,
			...item
		};

		if(specific_load[i]) scene.loaded[i] = specific_load[i](item_full);
		else scene.loaded[i] = item_full;
	};

	for(let i in loads.textures){
		const item = loads.textures[i];

		
		
		const item_full: { texture: any } = {
			texture: null,
			...item
		};

		if(item.type == "texture_map"){
			item_full.texture = [];
			for(let src of item.resource.sources!){
				item_full.texture.push(await scene.load[item.resource.type](src));
			}
		} else {
			item_full.texture = (await scene.load[item.resource.type](item.resource.src));
		}

		if(specific_load[i]) scene.loaded[i] = specific_load[i](item_full);
		else scene.loaded[i] = item_full as any;
	}

	for(let i in loads.shaders){

		const item = loads.shaders[i];

		const item_full = {
			...item
		}

		const name = i+'.shader';

		if(specific_load[name]) scene.loaded[name] = specific_load[name](item_full);
		else scene.loaded[name] = item_full as any;
	}

	loads.chunkTypes.forEach(type => {
		scene.loadedChunks.chunkTypes.push({
			...type,
			item: scene.findLoadedResource(type.item)
		})
	});
	
	
};