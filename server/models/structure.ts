import { BiomeData } from "./biome.js";
import { ServerData } from "./data.js";

export type StructureRule = {
	name: string,
	structure: {
		object: any,
		rule: string[]
	},
	density: number,
	random: boolean,
	above?: number,
	under?: number,
	loot?: boolean,
	drops?: { id: string, quantity: number, chance?: number, data?: any }[],
	randomDrops?: boolean,
	dropsCount?: number
}
export class StructureData extends ServerData {
	type: string = "";_looted

	biome!: BiomeData;
	rule!: StructureRule;
	looted = false;

	object3d: any = null;
}