import { item } from "./models/item";
import { THREE } from "enable3d";
import { CustomScene } from "./models/scene";
import { chunktype } from "./world";

export function makeObjectMaterial(shader: item, scene: CustomScene){
	
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
		...parseMaterialOptions(materialOptions)
	});
	
	return mat;
}


function parseMaterialOptions(options){
	const o = {};
	const keys = ['map', 'color', 'emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe'];
	for(let i of keys) if(i in options) o[i] = options[i];
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