import { item } from "./models/item";
import { THREE } from "enable3d";
import { CustomScene } from "./models/scene";
import { chunktype } from "./world";
import { mixColors } from "./colors";

const basicVariables = {
	mix(color1, color2, ratio){
		return mixColors(color1.trim(), color2.trim(), parseFloat(ratio));
	}
}

export function makeObjectMaterial(shader: item, scene: CustomScene, variables = {}){
	
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

function parseVariable(string: string, variables: Record<string, any> = {}){
	return typeof string == "string" ? string.replace(/\$([A-Za-z0-9]+)/g, (_, name) => variables[name] || _).replace(/([A-Za-z0-9]+)\(([^)]+)\)/g, (_, name, args) => variables[name] ? variables[name](...args.split(',')) : _) : string;
}

function parseMaterialOptions(options, variables = {}){
	const o = {};
	const keys = ['map', 'color', 'emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe'];
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