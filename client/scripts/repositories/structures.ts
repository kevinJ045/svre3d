import { Random } from "../../../server/common/rand";
import { PhysicsManager } from "../common/physics";
import { Chunk } from "../models/chunk";
import { Seed } from "../world/seed";
import { MaterialManager } from "./materials";
import { ResourceMap } from "./resources";
import { THREE } from "enable3d";


export function generateWithRule(item, rule, seed, object_rules?: string[]) {
	const generationRule = rule.generation_rule;

	const group = new THREE.Group();
	const keys = object_rules || Object.keys(generationRule);

	for (let key of keys) {
		if (generationRule.hasOwnProperty(key)) {
			const currentRule = generationRule[key];

			const objects = generateObjects(currentRule, item, group, seed);

			objects.forEach(object => {
				if(object) group.add(object);
			});
		}
	}

	return group;
}

export function generateObjects(rule, item, parent, seed, side = '') {
	const objects: any = [];
	const count = Array.isArray(rule.count) ? Random.from(rule.count[0], rule.count[1], seed) : rule.count;
	for (let i = 0; i < count; i++) {

		const name = Array.isArray(rule.name) ? rule.name[Random.from(0, rule.name.length-1, seed)] : rule.name;

		const object = createObject({...rule, name}, item, side, seed, parent);
		objects.push(object);

		// Handle forEach rule
		if (rule.forEach) {
			for (let key in rule.forEach) {
				if (rule.forEach.hasOwnProperty(key)) {
					const childRuleName = rule.forEach[key];
					const childRule = rule[childRuleName];
					if (childRule) {
						objects.push(...generateObjects(childRule, item, parent, seed, key));
					}
				}
			}
		}
	}
	return objects;
}

function createObject(rule, item, side, seed, parent?: any) {
	let position = new THREE.Vector3(...rule.position);
	const size = new THREE.Vector3(...rule.size);
	const rotation = new THREE.Euler(...rule.rotation);

	const g = new THREE.Group();
	
	let o;

	item.mesh.traverse(f => {
		if(f.name == rule.name) o = f.clone();
	});

	if(o) {
		if(side) position = getPositionForKey(side, parent, rule, seed);
		else if (Array.isArray(rule.position[0])) position = getRandomPos(rule.position, seed);
		
		o.castShadow = o.receiveShadow = true;
		o.position.copy(position);
	}
	else return g;

	o.userData.rule = rule;

	return o;
}

function getRandomPos(position, seed){
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


	static loadStrcuture(chunk: Chunk){

		if(chunk.structures.length){
			
			chunk.structures.forEach(structureData => {
				const rule = structureData.rule;

				const variables = {
					foliage: (structureData.biome.reference || structureData.biome).foliage?.color || "#00ff00"
				};		
				
				const object = ResourceMap.find(rule.object)!;

				const structure = generateWithRule(object, object.config!, Seed.rng, rule.object_rules);

				chunk.object3d.add(structure);

				const materialsRule = object!.config!.materials;

				structure.children.forEach(item => {
					if(item.userData.rule){
						if(item.userData.rule.physics === true){
							PhysicsManager.addPhysics(item as any, {
								shape: 'convex',
								mass: 0
							});
						}
					}
				});

				if(materialsRule){
					MaterialManager.applyMaterials(structure, materialsRule, variables);
				}

			});

		}

	}


}