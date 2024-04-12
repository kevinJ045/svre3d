import { BiomeData } from "./biome";
import { ServerData } from "./data";

export type StructureRule = {
	name: string,
	object: string,
	density: number,
	object_rules?: string[],
	random: boolean,
	above?: number,
	under?: number
}
export class StructureData extends ServerData {
	type: string = "";

	biome!: BiomeData;
	rule!: StructureRule;
}