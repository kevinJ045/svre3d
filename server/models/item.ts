import { ResourceMap } from "../repositories/resources";
import { ServerData } from "./data";


export class ItemData extends ServerData {
	quantity: number = 0;
	itemID: string = "";

	max = 1;
}