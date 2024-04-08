import { ServerData } from "../../../server/models/data";
import { ItemData } from "../../../server/models/item";
import { Item } from "../models/item";
import { ResourceMap } from "./resources";



export class Items {

	static create(itemData: ItemData){

		const item = ServerData.create(Item, itemData);

		const ref = ResourceMap.find(item.id)!;

		item.setReference(ref);

		return item;
	}

}