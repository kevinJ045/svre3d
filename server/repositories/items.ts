import { ItemData } from "../models/item";
import { jsonres } from "../models/jsonres";
import { pingFrom } from "../ping/ping";
import { Entities } from "./entities";
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

	static create(id: string, quantity = 1, data?: any){
		const ref = Items.find(id);
		if(ref){
			const item = new ItemData();
			item.max = ref.config?.inventory.max || 1;
			item.quantity = quantity;

			item.setReference(ref);
			item.itemID = id;

			if(data) item.data = data;

			return item;
		}
		return null;
	}

	static craftable(){
		return this.items.filter(i => i.config?.crafting);
	}

	static fromRecipe(preview = false, ...items: ItemData[]): { quantity: number, recipe: { item: string, quantity: number }[], item: jsonres, items?: ItemData[] } | null {
		const itemsIds = items.map(item => item.itemID).sort().join(',');
    	const item = this.craftable().find(i =>
		i.config!.crafting.recipe.map(r => r.item).sort().join(',') === itemsIds
    );

    if (!item) return null;

    const recipe = item.config!.crafting.recipe.map(r => ({ quantity: 1, ...r }));
    const quantity = item.config!.crafting.quantity;

    // Check if there are enough items for the recipe
    for (const { item: recipeItem, quantity: recipeItemCount } of recipe) {
		const item = items.find(i => i.itemID === recipeItem);
		if (!item || item.quantity < recipeItemCount) return null;
    }

    return {
		quantity,
		recipe,
		item,
		items: preview ? [] : items
    };
	}

	static startPing(socket){

		pingFrom(socket, 'crafting:recipe', ({entity: eid, items}) => {
			return Items.fromRecipe(true, ...items.map(i => Items.create(i.itemID, i.quantity)?.setData({ id: i.id })));
		});

		pingFrom(socket, 'crafting:craft', ({entity: eid, items}) => {
			const entity = Entities.find(eid);
			if(!entity) return;
			const recipe = Items.fromRecipe(false, ...items.map(i => Items.create(i.itemID, i.quantity)?.setData({ id: i.id })));
			if(recipe){

				for (const { item: recipeItem, quantity: recipeItemCount } of recipe.recipe) {
					const item = recipe.items!.find(i => i.itemID === recipeItem);
					entity.removeFromInventory(item!, recipeItemCount);
				}

				entity.addToInventory(Items.create(recipe.item.id, recipe.quantity)!);
				
				socket.broadcast.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
				socket.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
				return recipe;
			}
			return false;
		});

	}

}