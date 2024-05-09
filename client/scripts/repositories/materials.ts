import { basicVariables, parseVariable } from "../modules/variableMixer.js";
import { ResourceMap } from "./resources.js";
import { THREE } from "enable3d";



export class MaterialManager {

	static parseMaterial(mat: string | object, variables = {}){
		const materialOptions = typeof mat == "string" ? Object.fromEntries(
		mat.split('(')
		.splice(1)
		.join('(')
		.split(')')
		.slice(0, -1)
		.join(')')
		.split('\\,').join(';')
		.split(',')
		.map(i => i.split(':').map(t => parseVariable(t.trim().split(';').join(','), variables)))) : mat;
			
		let fragment = null, vertex = null;

		if(materialOptions.shader){
			fragment = materialOptions.shader?.fragment;
			vertex = materialOptions.shader?.vertex;
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
	
		const { fragment, vertex, materialOptions } = biome?.ground?.shader || { materialOptions: {} };
		
		const uniforms = {
			textureMap: { value: texture },
			// shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
		};

		const colorOptions: any = {};

		if(biome.tile_variation_color && biome.tile_variation_color !== 'none'){
			colorOptions.color = biome.tile_variation_color;
		}
	
		const mat = materialOptions ? new THREE.MeshStandardMaterial({
			...MaterialManager.parseMaterialOptions(materialOptions),
			map: texture,
			...colorOptions
		}) : new THREE.ShaderMaterial({
			fragmentShader: fragment,
			vertexShader: vertex,
			uniforms
		});
		
		return mat;
	}

	static applyMaterials(obj: any, mat: string | any[], variables = {}){
		const materialsRule = Array.isArray(mat) ? mat : [mat];
		obj.children.forEach((child: any, index: number) => {
			if(child.isGroup) return;
			const mat = materialsRule.length > 1 ? materialsRule[index] : materialsRule[0];
			if(mat){
				if(Array.isArray(child.material)){
					if(Array.isArray(mat)) child.material = materialsRule.map(mat => {
						console.log(mat);
						return MaterialManager.parse(mat, variables);
					});
					else if(typeof mat == "object") {
						child.material = child.material.map(mate => {
							if(mate.name in mat){
								return MaterialManager.parse(mat[mate.name], variables);
							} else {
								return mate;
							}
						});
					} else {
						child.material = MaterialManager.parse(mat, variables);
					}
				} else{
					child.material = typeof mat == 'object' && child.material.name in mat 
					? MaterialManager.parse(mat[child.material.name], variables)
					: MaterialManager.parse(mat, variables);
				}
			}
		});
	}

}