import { THREE } from "enable3d";
import { toload } from "./loader.js";
import { Utils } from "./utils.js";
import { OBJLoader } from "../lib/OBJLoader.js";
import { FontLoader } from "../lib/FontLoader.js";
const loaders = {
    obj: async (url) => {
        const loader = new OBJLoader(new THREE.LoadingManager);
        return new Promise((r, re) => {
            loader.load(url, (item) => {
                r(item);
            }, null, () => re(null));
        });
    },
    font: async (url) => {
        const fontLoader = new FontLoader(new THREE.LoadingManager);
        return new Promise((r, re) => {
            fontLoader.load(url, (item) => {
                r(item);
            }, null, () => re(null));
        });
    },
    image: async (url) => {
        return new Promise((r, re) => {
            const playerIcon = new Image();
            playerIcon.src = url;
            playerIcon.onload = () => {
                r(playerIcon);
            };
        });
    }
};
export const preload = async (scene) => {
    const loads = await toload();
    for (let undefinedItem of loads) {
        let load = null;
        const item = { ...undefinedItem };
        // console.log(undefinedItem.id);
        if (item.resource) {
            const type = item.resource.type;
            if (item.type.endsWith("_map")) {
                load = [];
                for (let src of item.resource.sources) {
                    load.push(await scene.load[type](src));
                }
            }
            else if (type in scene.load) {
                load = await ((scene.load[type])(item.resource.src));
            }
            else if (type in loaders) {
                load = await ((loaders[type])(item.resource.src));
            }
            if (type == "texture") {
                item.texture = load;
            }
            else if (type == "gltf" || type == "obj" || type == "fbx") {
                item.mesh = type == "gltf" ? load.scene : load;
            }
            else if (item.type == "shader") {
                item.id = item.id + '.shader';
                if (item.resource.sources) {
                    if (!item['vertex'])
                        item['vertex'] = await Utils.loadText(item.resource.sources[0]);
                    if (!item['fragment'])
                        item['fragment'] = await Utils.loadText(item.resource.sources[1]);
                }
            }
            item.load = load;
        }
        const group = item.loader ? item.loader.group : item.type;
        if (item.type == "biome") {
            scene.loadedChunks.chunkTypes.push({
                ...item,
                item: scene.findLoadedResource(item.item, 'textures')
            });
        }
        else if (item.type == 'particle') {
            scene.particleSystem.registerFromJson(item);
        }
        else {
            if (!scene.loaded[group])
                scene.loaded[group] = [];
            scene.loaded[group].push(item);
        }
    }
    scene.loadedChunks.chunkTypes = Utils.shuffleArray(scene.loadedChunks.chunkTypes, scene.loadedChunks.rng);
    scene.items.loadItems();
};