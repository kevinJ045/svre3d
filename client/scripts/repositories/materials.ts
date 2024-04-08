import { basicVariables, parseVariable } from "../modules/variableMixer";
import { ResourceMap } from "./resources";
import { THREE } from "enable3d";



export class MaterialManager {

	static parseMaterial(mat: string, variables = {}){
		const materialOptions = Object.fromEntries(mat.split('(')[1]
		.split(')')[0]
		.split(',')
		.map(i => i.split(':').map(t => t.trim())));
	
		let fragment = null, vertex = null;
		
		if(materialOptions.shader){
			const shader = ResourceMap.find(materialOptions.shader);
			fragment = shader?.fragment;
			vertex = shader?.vertex;
		}
	
		return MaterialManager.makeObjectMaterial({
			fragment,
			vertex,
			materialOptions
		}, variables);
	}

	static makeObjectMaterial(shader: any, variables = {}){
	
		const { fragment, vertex, materialOptions } = shader;
	
		const uniforms: Record<string, any> = {
			// textureMap: { value: texture },
			// shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
		};
	
		if(materialOptions.texture){
			const texture = ResourceMap.find(materialOptions.texture);
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
			...MaterialManager.parseMaterialOptions(materialOptions, {...variables, ...basicVariables})
		});
		
		return mat;
	}

	static parseMaterialOptions(options, variables = {}){
		const o = {};
		const keys = ['map', 'color', 'emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe', 'transparent'];
		for(let i of keys) if(i in options) o[i] = parseVariable(options[i], variables);
		return o;
	}

	static parse(mat: string, variables){
		return mat.startsWith('mat(') ? MaterialManager.parseMaterial(mat, variables): MaterialManager.makeObjectMaterial(
			ResourceMap.find(mat),
			variables
		)
	}

	static makeSegmentMaterial(texture: THREE.Texture, biome: any){
	
		const { fragment, vertex, materialOptions } = (ResourceMap.find(biome.shader ? biome.shader+'.shader' : 'm:segment.shader') || {}) as any;

		const uniforms = {
			textureMap: { value: texture },
			// shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
		};
	
		const mat = materialOptions ? new THREE.MeshStandardMaterial({
			...MaterialManager.parseMaterialOptions(materialOptions),
			map: texture
		}) : new THREE.ShaderMaterial({
			fragmentShader: fragment,
			vertexShader: vertex,
			uniforms
		});
		
		return mat;
	}

}