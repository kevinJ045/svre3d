import { Random } from "../../../server/common/rand.js";
import { mixColors } from "../common/colors.js";
import { PhysicsManager } from "../common/physics.js";
import { SceneManager } from "../common/sceneman.js";
import { GPUComputationRenderer } from "../lib/GPUCompRendr.js";
import { Chunk } from "../models/chunk.js";
import { WorldData } from "../world/data.js";
import { Seed } from "../world/seed.js";
import { Items } from "./items.js";
import { MaterialManager } from "./materials.js";
import { ResourceMap } from "./resources.js";
import { THREE } from "enable3d";


export function generateWithRule(item, seed, object_rules?: string[], looted?: boolean) {
	const generationRule = item.structures;

	const group = new THREE.Group();
	const keys = object_rules || Object.keys(generationRule);

	for (let key of keys) {
		if (generationRule.hasOwnProperty(key)) {
			const currentRule = generationRule[key];

			const objects = generateObjects(currentRule, item, group, seed, '', looted);

			objects.forEach(object => {
				if (object) group.add(object);
			});
		}
	}

	return group;
}

export function generateObjects(rule, item, parent, seed, side = '', looted) {
	const objects: any = [];
	const count = Array.isArray(rule.count) ? Random.from(rule.count[0], rule.count[1], seed) : rule.count;
	for (let i = 0; i < count; i++) {

		let name = Array.isArray(rule.name) ? rule.name[Random.from(0, rule.name.length - 1, seed)] : rule.name;

		const object = createObject({ ...rule, name }, item, side, seed, parent, looted);
		objects.push(object);

		// Handle forEach rule
		if (rule.forEach) {
			for (let key in rule.forEach) {
				if (rule.forEach.hasOwnProperty(key)) {
					const childRuleName = rule.forEach[key];
					const childRule = rule[childRuleName];
					if (childRule) {
						objects.push(...generateObjects(childRule, item, parent, seed, key, looted));
					}
				}
			}
		}
	}
	return objects;
}

function createObject(rule, item, side, seed, parent?: any, looted?: any) {
	let position = new THREE.Vector3(...rule.position);
	if (!rule.size.length) rule.size = Array(3).fill(0);
	const size = new THREE.Vector3(...rule.size);
	const rotation = new THREE.Euler(...rule.rotation);

	const name = looted ? rule.looted : rule.name;

	const g = new THREE.Group();

	let o;

	item.resource.mesh.traverse(f => {
		if (f.name == name) o = f.clone();
	});

	if (o) {
		if (side) position = getPositionForKey(side, parent, rule, seed);
		else if (Array.isArray(rule.position[0])) position = getRandomPos(rule.position, seed);

		if (!rule.size.includes(0)) o.scale.set(...size);

		o.castShadow = o.receiveShadow = true;
		o.position.copy(position);
	}
	else return g;

	o.userData.rule = rule;

	return o;
}

function getRandomPos(position, seed) {
	return new THREE.Vector3(
		Random.from(position[0][0], position[0][1], seed),
		Random.from(position[1][0], position[1][1], seed),
		Random.from(position[2][0], position[2][1], seed)
	);
}

function getPositionForKey(key, parentObject, childRule, seed) {
	let position;
	if (Array.isArray(childRule.position[0])) {
		position = getRandomPos(childRule.position, seed);
	} else {
		position = new THREE.Vector3(...childRule.position);
	}
	switch (key) {
		case 'side':
			const sides = ['left', 'right', 'front', 'back'].filter(i => parentObject.userData.sides ? parentObject.userData.sides.indexOf(i) > -1 : true);
			const side = childRule.side ? Random.pick(...sides) : childRule.side;
			switch (side) {
				case 'left':
					position.add(parentObject.position.clone().multiplyScalar(0.5));
					break;
				case 'right':
					position.sub(parentObject.position.clone().multiplyScalar(0.5));
					break;
				case 'front':
					position.add(new THREE.Vector3(0, 0, parentObject.scale.z / 2));
					break;
				case 'back':
					position.sub(new THREE.Vector3(0, 0, parentObject.scale.z / 2));
					break;
			}
			parentObject.userData.sides = sides.filter(f => f !== side);
			break;
		case 'top':
			position.add(parentObject.position.clone().add(new THREE.Vector3(0, parentObject.scale.y, 0)));
			break;
	}
	return position;
}


export class Structures {

	static createStructureTemplate(structureProps: any, resource: THREE.Texture, chunk: Chunk, variables: any) {
		const g = new THREE.Group();
		const heightPercent = structureProps.height || 50;
		const fullHeight = chunk.chunkSize / 2;

		const height = (heightPercent / 100) * fullHeight;
		const object = new THREE.Mesh(new THREE.PlaneGeometry(chunk.chunkSize, chunk.chunkSize), new THREE.MeshBasicMaterial({ color: 0xffffff }));

		object.rotation.x = - Math.PI / 2;

		resource.wrapS = resource.wrapT = THREE.RepeatWrapping;

		var uniforms = {
			time: {
				value: 0
			},
			threshold: {
				value: structureProps.threshold || 0.1
			},
			tDudv: {
				value: null
			},
			tDepth: {
				value: null
			},
			cameraNear: {
				value: 0
			},
			cameraFar: {
				value: 0
			},
			resolution: {
				value: new THREE.Vector2()
			},
			foamColor: {
				value: new THREE.Color(mixColors(variables.water || '#00aaaa', '#ffffff', 0.3))
			},
			waterColor: {
				value: new THREE.Color(variables.water || '#00aaaa')
			}
		};

		const liquidShaderVertex = structureProps.vertex || '';
		const liquidShaderFragment = structureProps.fragment || '';

		var waterMaterial = new THREE.ShaderMaterial({
			defines: {
				DEPTH_PACKING: 1,
				ORTHOGRAPHIC_CAMERA: 0
			},
			uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], uniforms]),
			vertexShader: liquidShaderVertex,
			fragmentShader: liquidShaderFragment,
			fog: true
		});

		waterMaterial.uniforms.cameraNear.value = 0.1;
		waterMaterial.uniforms.cameraFar.value = 100000000;
		waterMaterial.uniforms.resolution.value.set(
			window.innerWidth * 1,
			window.innerHeight * 1
		);

		object.userData.renderTarget = new THREE.WebGL3DRenderTarget(SceneManager.scene.renderer.domElement.width, SceneManager.scene.renderer.domElement.height);

		waterMaterial.uniforms.tDudv.value = resource;
		waterMaterial.uniforms.tDepth.value = object.userData.renderTarget.depthTexture;


		(object as any).material = waterMaterial;

		g.add(object);
		g.position.set(0, structureProps.useWorldHeight ? WorldData.get('waterHeight', 3.75) - chunk.position.y : height, 0);

		if (!chunk.data.liquids) chunk.data.liquids = [];
		chunk.data.liquids.push(object);
		return g;
	}


	static loadStrcuture(chunk: Chunk) {

		if (chunk.structures.length) {

			chunk.structures.forEach(structureData => {
				const rule = structureData.rule;

				const variables = {
					foliage: (structureData.biome.reference || structureData.biome).biome?.foliage?.color || "#00ff00",
					water: (structureData.biome.reference || structureData.biome).biome?.water?.color || "#0000ff",
					log: true
				};

				const structureProps = ResourceMap.findLoad(rule.structure.object.manifest.id)!;


				const structureIsLiquid = rule.structure.object?.view?.object?.type == "liquid";

				const structure = structureIsLiquid ? this.createStructureTemplate(rule.structure.object.view.object, structureProps!.texture, chunk, variables) : generateWithRule(structureProps, Seed.rng, rule.structure.rule, structureData.looted);

				if (structureProps.view?.animation) {
					Items.initItemAnimation({ reference: structureProps } as any, structure);
				}

				chunk.object3d.add(structure);

				if (rule.loot) {
					structure
					structure.userData.lootable = true;
				}

				const materialsRule = structureIsLiquid ? null : structureProps!.view!.material;

				structure.children.forEach(item => {
					if (item.userData.rule) {
						if (item.userData.rule.physics === true) {
							PhysicsManager.addPhysics(item as any, {
								shape: 'convex',
								mass: 0
							});
						}
						if (rule.loot) item.userData.lootable = true;
						item.userData.structure = structureData;
					}
				});

				if (materialsRule) {
					MaterialManager.applyMaterials(structure, materialsRule, variables);
				}


				structureData.object3d = structure;

			});

		}

	}


}
