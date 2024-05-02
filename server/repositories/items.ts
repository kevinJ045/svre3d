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

	static gemEnchant(item1: ItemData, item2: ItemData){
		if(!item1 || !item2) return false;
		if(item2.reference.config?.powergem
		  && (item1.reference.config?.powergems !== false)
		  && !(item1.reference.config?.exclude_gems || []).includes(item2.itemID)){

			return {
				item: item1,
				quantity: item1.quantity
			};
		}
		return false;
	}

	static fromRecipe(preview = false, tool: string, ...items: ItemData[]): { quantity: number, recipe: { item: string, quantity: number }[], item: jsonres, items?: ItemData[] } | null {
		const itemsIds = items.map(item => item.itemID).sort();
		const item = this.craftable().find(i =>
			{
				const itemsr = i.config!.crafting.recipe.map(r => r.item).sort();
				if(itemsIds.length < itemsr.length) itemsIds.push('empty');
				else if(itemsIds.length > itemsr.length) itemsIds.indexOf('empty') ? itemsIds.splice(itemsIds.indexOf('empty')) : null;
				return itemsr.join(',') === itemsIds.sort().join(',')
			}
		);

		if (!item) return null;

		const recipe = item.config!.crafting.recipe.map(r => ({ quantity: 1, ...r }));

		if(item.config!.crafting.tool !== tool && item.config!.crafting.tool !== 'any')
			return null;

		const quantity = item.config!.crafting.quantity;

		// Check if there are enough items for the recipe
		for (const { item: recipeItem, quantity: recipeItemCount } of recipe) {
			if(recipeItem == 'empty') continue;
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

	static itemFromEntity(entity, item){
		return entity.inventory.find(i => i.id == item?.id);
	}

	static startPing(socket){

		pingFrom(socket, 'crafting:recipe', ({entity: eid, tool, items}) => {
			const entity = Entities.find(eid);
			if(!entity) return;
			return Items.fromRecipe(true, tool, ...items.map(i => Items.create(i.itemID, i.quantity)?.setData({ id: i.id }))) || Items.gemEnchant(Items.itemFromEntity(entity, items[0]), Items.itemFromEntity(entity, items[1]));
		});

		pingFrom(socket, 'crafting:craft', ({entity: eid, tool, items}) => {
			const entity = Entities.find(eid);
			if(!entity) return;
			const recipe = Items.fromRecipe(false, tool, ...items.map(i => Items.create(i.itemID, i.quantity)?.setData({ id: i.id })));
			if(recipe){

				for (const { item: recipeItem, quantity: recipeItemCount } of recipe.recipe) {
					if(recipeItem == 'empty') continue;
					const item = recipe.items!.find(i => i.itemID === recipeItem);
					if(!item?.reference.config?.isTool) entity.removeFromInventory(item!, recipeItemCount);
				}

				entity.addToInventory(Items.create(recipe.item.id, recipe.quantity)!);
				
				socket.broadcast.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
				socket.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
				return recipe;
			} else {
				const recipe = Items.gemEnchant(Items.itemFromEntity(entity, items[0]), Items.itemFromEntity(entity, items[1]));
				if(recipe){
					entity.removeFromInventory(items[1]);
					entity.removeFromInventory(items[0]);

					// add item stats here.

					entity.addToInventory(recipe.item);
					socket.broadcast.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
					socket.emit('entity:inventory', { entity: entity.id, full: true, inventory: entity.inventory });
					return recipe;
				}
			}
			return false;
		});

	}

}