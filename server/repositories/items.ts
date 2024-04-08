import { ItemData } from "../models/item";
import { jsonres } from "../models/jsonres";
import { ResourceMap } from "./resources";



export class Items {

	static items: jsonres[] = [];

	static filterItems(){
		Items.items = ResourceMap.resources
		.filter(
			i => i.data.config?.item
		)
		.map(
			i => i.data
		);
	}

	static find(id: string){
		return Items.items.find(i => i.id == id);
	}

	static create(id: string, quantity = 1){
		const ref = Items.find(id);
		if(ref){
			const item = new ItemData();
			item.max = ref.config?.inventory.max || 1;
			item.quantity = quantity;


			return item;
		}
		return null;
	}

}