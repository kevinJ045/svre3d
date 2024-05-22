import { THREE } from "enable3d";
import { basicVariables, parseVariable } from "./variableMixer.js";
export function makeObjectMaterial(shader, scene, variables = {}) {
    const { fragment, vertex, materialOptions } = shader;
    const uniforms = {
    // textureMap: { value: texture },
    // shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
    };
    if (materialOptions.texture) {
        const texture = scene.findLoadedResource(materialOptions.texture, 'textures');
        if (texture) {
            uniforms.textureMap = { value: texture.texture };
            materialOptions.map = texture.texture;
        }
        delete materialOptions.texture;
    }
    const mat = fragment && vertex ? new THREE.ShaderMaterial({
        fragmentShader: fragment,
        vertexShader: vertex,
        uniforms
    }) : new THREE.MeshStandardMaterial({
        ...parseMaterialOptions(materialOptions, { ...variables, ...basicVariables })
    });
    return mat;
}
function parseMaterial(mat, scene, variables = {}) {
    const materialOptions = Object.fromEntries(mat.split('(')[1]
        .split(')')[0]
        .split(',')
        .map(i => i.split(':').map(t => t.trim())));
    let fragment = null, vertex = null;
    if (materialOptions.shader) {
        const shader = scene.findLoadedResource(materialOptions.shader, 'shaders');
        fragment = shader?.fragment;
        vertex = shader?.vertex;
    }
    return makeObjectMaterial({
        fragment,
        vertex,
        materialOptions
    }, scene, variables);
}
export function materialParser(mat, scene, variables) {
    return mat.startsWith('mat(') ? parseMaterial(mat, scene, variables) : makeObjectMaterial(scene.findLoadedResource(mat, 'shaders'), scene, variables);
}
function parseMaterialOptions(options, variables = {}) {
    const o = {};
    const keys = ['map', 'color', 'emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe', 'transparent'];
    for (let i of keys)
        if (i in options)
            o[i] = parseVariable(options[i], variables);
    return o;
}
export function makeSegmentMaterial(texture, chunkType, scene) {
    const { fragment, vertex, materialOptions } = (scene.findLoadedResource(chunkType.shader ? chunkType.shader + '.shader' : 'm:segment.shader', 'shaders', 'm:segment.shader') || {});
    const uniforms = {
        textureMap: { value: texture },
        // shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
    };
    const mat = materialOptions ? new THREE.MeshStandardMaterial({
        ...parseMaterialOptions(materialOptions),
        map: texture
    }) : new THREE.ShaderMaterial({
        fragmentShader: fragment,
        vertexShader: vertex,
        uniforms
    });
    return mat;
}
export function applyMaterials(obj, mat, scene, variables = {}) {
    const materialsRule = Array.isArray(mat) ? mat : [mat];
    obj.children.forEach((child, index) => {
        const mat = materialsRule.length > 1 ? materialsRule[index] : materialsRule[0];
        if (mat) {
            if (Array.isArray(child.material)) {
                if (Array.isArray(mat))
                    child.material = materialsRule.map(mat => {
                        return materialParser(mat, scene, variables);
                    });
                else if (typeof mat == "object") {
                    child.material = child.material.map(mate => {
                        if (mate.name in mat) {
                            return materialParser(mat[mate.name], scene, variables);
                        }
                        else {
                            return mate;
                        }
                    });
                }
                else {
                    child.material = materialParser(mat, scene, variables);
                }
            }
            else {
                child.material = materialParser(mat, scene, variables);
            }
        }
    });
}
