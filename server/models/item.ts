import { ResourceMap } from "../repositories/resources.js";
import { ServerData } from "./data.js";


export class ItemData extends ServerData {
	quantity: number = 0;
	itemID: string = "";

	max = 1;

	data: any = {};
    class = "common";
}