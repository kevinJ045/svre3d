import { mixColors } from "./colors";

export const basicVariables = {
	mix(color1, color2, ratio){
		return mixColors(color1.trim(), color2.trim(), parseFloat(ratio));
	}
}


export function parseVariable(string: string, variables: Record<string, any> = basicVariables){
	return typeof string == "string" ? string.replace(/\$([A-Za-z0-9]+)/g, (_, name) => variables[name] || _).replace(/([A-Za-z0-9]+)\(([^)]+)\)/g, (_, name, args) => variables[name] ? variables[name](...args.split(',')) : _) : string;
}

export function setVector3Var(object, prop, value, variables = {}){
	if(typeof value == "string"){
		object[prop].set(variables[value].x, variables[value].y, variables[value].z);
	} else {
		object[prop].set(value.x, value.y, value.z);
	}
}


export function generateName() {
	const vowels = "aeiou";
	const consonants = "bcdfghjklmnpqrstvwxyz";
	const nameLength = Math.floor(Math.random() * 3) + 3; // Random name length between 3 and 5 characters
	let name = "";

	for (let i = 0; i < nameLength; i++) {
		// Alternate between consonants and vowels
		if (i % 2 === 0) {
			name += consonants.charAt(Math.floor(Math.random() * consonants.length));
		} else {
			name += vowels.charAt(Math.floor(Math.random() * vowels.length));
		}
	}

	return name;
}