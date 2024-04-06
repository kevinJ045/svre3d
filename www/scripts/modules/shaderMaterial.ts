import { item } from "./models/item";
import { THREE } from "enable3d";
import { CustomScene } from "./models/scene";
import { chunktype } from "./world";
import { basicVariables, parseVariable } from "./variableMixer";


export function makeObjectMaterial(shader: any, scene: CustomScene, variables = {}){
	
	const { fragment, vertex, materialOptions } = shader;

	const uniforms: Record<string, any> = {
		// textureMap: { value: texture },
		// shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
	};

	if(materialOptions.texture){
		const texture = scene.findLoadedResource(materialOptions.texture, 'textures');
		if(texture) {
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
		...parseMaterialOptions(materialOptions, {...variables, ...basicVariables})
	});
	
	return mat;
}

function parseMaterial(mat: string, scene, variables = {}){
	const materialOptions = Object.fromEntries(mat.split('(')[1]
	.split(')')[0]
	.split(',')
	.map(i => i.split(':').map(t => t.trim())));

	let fragment = null, vertex = null;
	
	if(materialOptions.shader){
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

export function materialParser(mat: string, scene, variables){
	return mat.startsWith('mat(') ? parseMaterial(mat, scene, variables): makeObjectMaterial(
		scene.findLoadedResource(mat, 'shaders'),
		scene,
		variables
	);
}

function parseMaterialOptions(options, variables = {}){
	const o = {};
	const keys = ['map', 'color', 'emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe', 'transparent'];
	for(let i of keys) if(i in options) o[i] = parseVariable(options[i], variables);
	return o;
}

export function makeSegmentMaterial(texture: THREE.Texture, chunkType: chunktype, scene: CustomScene){
	
	const { fragment, vertex, materialOptions } = (scene.findLoadedResource(chunkType.shader ? chunkType.shader+'.shader' : 'm:segment.shader', 'shaders', 'm:segment.shader') || {}) as any;

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

export function applyMaterials(obj: any, mat: string | any[], scene: CustomScene, variables = {}){
	const materialsRule = Array.isArray(mat) ? mat : [mat];
	obj.children.forEach((child: any, index: number) => {
		const mat = materialsRule.length > 1 ? materialsRule[index] : materialsRule[0];
		if(mat){
			if(Array.isArray(child.material)){
				if(Array.isArray(mat)) child.material = materialsRule.map(mat => {
					return materialParser(mat, scene, variables);
				});
				else if(typeof mat == "object") {
					child.material = child.material.map(mate => {
						if(mate.name in mat){
							return materialParser(mat[mate.name], scene, variables);
						} else {
							return mate;
						}
					});
				} else {
					child.material = materialParser(mat, scene, variables);
				}
			} else{
				child.material = materialParser(mat, scene, variables);
			}
		}
	});
}