import { ResourceMap } from "../repositories/resources.ts";
import { ServerData } from "./data.ts";


export class ItemData extends ServerData {
	quantity: number = 0;
	itemID: string = "";

	max = 1;

	data: any = {};
    class = "common";
}