import { Scene3D, THREE } from "enable3d";
import { jsonres } from "../common/jsonres.js";
import { OBJLoader } from "../lib/OBJLoader.js";
import { FontLoader } from "../lib/FontLoader.js";
import { Utils } from "../modules/utils.js";
import { ResourceSchema } from "../../../server/lib/loader/Schema.type.js";
import { getPropStr } from "../../../server/common/getpropstr.js";

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
		return new Promise((r, re) => {
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
	return '/resources/' + item.manifest.id.split(':').join('/') + '/' + suffix;
}

export const loadItem = async (item, scene, suffix = 'res', parent?: ResourceSchema) => {
	let load: any = null;
	const type = item.resource.loader;

	if (item.manifest.type.endsWith("_map")) {
		load = [];
		for (let index in item.resource.sources!) {
			load.push(await loaders[type](
				resolvePath(parent || item, suffix ? suffix + '.' + index : undefined)
			));
		}
	} else if (type in scene.load) {
		load = await ((scene.load[type])(resolvePath(parent || item, suffix ? suffix : undefined)));
	} else if (type in loaders) {
		load = await ((loaders[type])(resolvePath(parent || item, suffix ? suffix : undefined)));
	}


	if (type == "texture") {
		item.texture = load;
	} else if (type == "gltf" || type == "obj" || type == "fbx") {
		item.resource.mesh = type == "gltf" ? load.scene : load;
	} else if (item.type == "shader") {
		item.id = item.id + '.shader';
		if (item.resource.sources) {
			if (!item['vertex']) item['vertex'] = await Utils.loadText(item.resource.sources![0]);
			if (!item['fragment']) item['fragment'] = await Utils.loadText(item.resource.sources![1]);
		}
	}

	item.resource.load = load;
	ResourceMap.loaded.push(item);
}

export class ResourceMap {

	static resources: ResourceSchema[] = [];
	static queue: ResourceSchema[] = [];

	static loaded: ResourceSchema[] = [];

	static async loadAll(scene: Scene3D) {

		for (let undefinedItem of ResourceMap.queue) {


			const item = { ...undefinedItem };


			if (item.resource) {

				if (item.resource.preload) {
					for (let i of item.resource.preload) {
						let independent = i.startsWith('!');
						let pn: any = {};
						if (independent) {
							i = i.split('!')[1];
							pn.name = i.split(':')[0];
							pn.loader = i.split(':')[1];
							i = pn.name;
						}
						let [fetchName, name] : string[] = i.match('@') ? i.split('@') : [i, i];
						let prop = getPropStr(item, name);

						// Handling arrays in property path
						let propertyPathParts = name.split('.');
						let arrayMatch = propertyPathParts.find(part => part.includes('*'));
						if (arrayMatch) {
							const propName = propertyPathParts.slice(0, propertyPathParts.indexOf(arrayMatch)).join('.');
							let prop: any[] = propName.match('.') ? getPropStr(item, propName) : item[propName] as any;

							const itemProps = propertyPathParts.slice(propertyPathParts.indexOf(arrayMatch) + 1, propertyPathParts.length).join('.');

							for (let index = 0; index < prop.length; index++) {
								const elt = prop[index];
								let eltprop = itemProps.length ? getPropStr(elt, itemProps) : elt;
								let fn = fetchName.replace(/\$([0-9]+)/g, (_, n) => index.toString());
								if(eltprop.resource) await loadItem(eltprop, scene, 'res?prop=' + fn, item);
							}
						} else {
							if (independent) {
								prop = {
									manifest: {
										id: item.id + '.' + name,
										type: 'image',
									},
									resource: pn,
								};
							}
							
							await loadItem(prop, scene, 'res?prop=' + fetchName, item);
							if (independent) {
								getPropStr(item, name.split('.').slice(0, -1).join('.'))
								[name.split('.').pop()!] = prop.resource.load;
							}
						}

					}
				}

				if (item.resource.loader) {
					await loadItem(item, scene);
				}
			}

			ResourceMap.resources.push(item);
			// ResourceMap.queue.splice(ResourceMap.queue.indexOf(undefinedItem), 1);
		}
		while (ResourceMap.queue.length) ResourceMap.queue.pop();
	}

	static find(id: string, type?: string) {
		return ResourceMap.resources.find(i => i.manifest?.id == id && (type ? i.type == type : true));
	}

	static findLoad(id: string, type?: string) {
		return ResourceMap.loaded.find(i => i.manifest?.id == id && (type ? i.type == type : true));
	}

}