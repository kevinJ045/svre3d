import { ServerData } from "./data.js";
import { jsonres } from "./jsonres.js";


export class BiomeData extends ServerData {
	type: string = "";
	item!: jsonres;
}