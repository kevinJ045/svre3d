import { THREE } from "enable3d";

export function generateWithRule(item, rule) {
	const generationRule = rule.generation_rule;

	const group = new THREE.Group();

	for (let key in generationRule) {
		if (generationRule.hasOwnProperty(key)) {
			const currentRule = generationRule[key];

			// Generate objects based on current rule
			const objects = generateObjects(currentRule, item);

			// Add generated objects to the scene
			objects.forEach(object => {
				if(object) group.add(object);
			});
		}
	}

	return group;
}

export function generateObjects(rule, item) {
	const objects: any = [];
	const count = Array.isArray(rule.count) ? getRandomInt(rule.count[0], rule.count[1]) : rule.count;
	for (let i = 0; i < count; i++) {
		const object = createObject(rule, item);
		objects.push(object);

		// Handle forEach rule
		if (rule.forEach) {
			for (let key in rule.forEach) {
				if (rule.forEach.hasOwnProperty(key)) {
					const childRuleName = rule.forEach[key];
					const childRule = rule[childRuleName];
					if (childRule) {
						// Set position for child object based on key
						const position = getPositionForKey(key, object, childRule);
						childRule.position = position;
						// Generate child objects recursively
						objects.push(...generateObjects(childRule, item));
					}
				}
			}
		}
	}
	return objects;
}

function createObject(rule, item) {
	const position = new THREE.Vector3(...rule.position);
	const size = new THREE.Vector3(...rule.size);
	const rotation = new THREE.Euler(...rule.rotation);

	const g = new THREE.Group();
	
	let o;

	item.mesh.traverse(f => {
		if(f.name == rule.name) o = f.clone();
	});

	if(o){
		o.position.copy(position);
		o.rotation.copy(rotation);
		// o.scale.copy(size);
	}

	if(rule.count > 1)


	return rule.count > 1 ? g : o;
	
	// mesh.position.copy(position);
	// mesh.scale.copy(size);
	// mesh.rotation.copy(rotation);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPositionForKey(key, parentObject, childRule) {
	const position = new THREE.Vector3(...childRule.position);
	switch (key) {
			case 'side':
					position.add(parentObject.position.clone().multiplyScalar(0.5)); // Adjust position based on parent object
					break;
			case 'top':
					position.add(parentObject.position.clone().add(new THREE.Vector3(0, parentObject.scale.y, 0))); // Adjust position based on parent object
					break;
			// Add more cases for other positioning rules if needed
	}
	return position;
}
