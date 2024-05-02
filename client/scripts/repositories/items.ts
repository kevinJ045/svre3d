import { ServerData } from "../../../server/models/data";
import { ItemData } from "../../../server/models/item";
import { Item } from "../models/item";
import { ping } from "../socket/socket";
import { PlayerInfo } from "./player";
import { ResourceMap } from "./resources";



export class Items {

	static create(itemData: ItemData){

		const item = ServerData.create(Item, itemData);

		const ref = ResourceMap.find(item.itemID)!;
		
		item.setReference(ref);
		item.max = ref.config?.inventory?.max || 1;

		return item;
	}

	private static crafting_request: any;
	static crafting(recipe = true, tool: string, ...items: Item[]){
		if(this.crafting_request) Promise.resolve(this.crafting_request);
		this.crafting_request = ping('crafting:'+(recipe ? 'recipe' : 'craft'), {entity: PlayerInfo.entity.id, tool, items:items.map(i => ({ itemID: i.itemID, max: i.max, quantity: i.quantity, id: i.id, options: (i as any).options }))})
		.then((e) => {
			this.crafting_request = null;
			return e;
		});
		return this.crafting_request;
	}

	static all(){
		return  ResourceMap.resources
		.filter(
			i => i.config?.item
		);
	}

}