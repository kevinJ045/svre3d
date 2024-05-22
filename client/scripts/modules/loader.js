import { Utils } from "./utils.js";
export const types = [
    'objects', 'textures', 'shaders', 'biomes', 'particles'
];
export const toload = async () => {
    const data = [];
    for (let i of types) {
        const objects = await Utils.dirToJson('json/' + i);
        for (let object of objects) {
            data.push(object);
        }
    }
    return data;
};
