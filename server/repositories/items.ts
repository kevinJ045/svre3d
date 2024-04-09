import { ItemData } from "../models/item";
import { jsonres } from "../models/jsonres";
import { pingFrom } from "../ping/ping";
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

			item.setReference(ref);
			item.itemID = id;

			return item;
		}
		return null;
	}

	static craftable(){
		return this.items.filter(i => i.config?.crafting);
	}

	static fromRecipe(...items: ItemData[]): { quantity: number, recipe: { item: string, quantity: number }[], item: jsonres } | null {
    const itemsIds = items.map(item => item.itemID).sort().join(',');
    const item = this.craftable().find(i =>
			i.config!.crafting.recipe.map(r => r.item).sort().join(',') === itemsIds
    );

    if (!item) return null;

    const recipe = item.config!.crafting.recipe.map(r => ({ quantity: 1, ...r }));
    const quantity = item.config!.crafting.quantity;

    // Check if there are enough items for the recipe
    for (const { item: recipeItem, count: recipeItemCount } of recipe) {
			const item = items.find(i => i.itemID === recipeItem);
			if (!item || item.quantity < recipeItemCount) return null;
    }

    return {
			quantity,
			recipe,
			item
    };
	}

	static startPing(socket){

		pingFrom(socket, 'item:crafting', (items) => {
			return Items.fromRecipe(...items.map(i => Items.create(i.itemID, i.quantity)?.setData({ id: i.id })));
		});

	}

}