import { ServerData } from "./data.ts";
import { jsonres } from "./jsonres.ts";


export class BiomeData extends ServerData {
	type: string = "";
	item!: jsonres;
}