import { ResourceSchema } from "../lib/loader/Schema.type.js";
import { ItemData } from "../models/item.js";
import { jsonres } from "../models/jsonres.js";
import { pingFrom } from "../ping/ping.js";
import { Entities } from "./entities.js";
import { ResourceMap } from "./resources.js";

export class Items {

	static items: ResourceSchema[] = [];

	static filterItems(){
		Items.items = ResourceMap.all()
		.filter(
			i => i.manifest?.type == 'item'
		);
	}

	static find(id: string){
		return Items.items.find(i => i.manifest.id == id);
	}

	static create(id: string, quantity = 1, data?: any){
		const ref = Items.find(id);
		if(ref){
			const item = new ItemData();
			item.max = ref.item.inventory?.max || 1;
			item.quantity = quantity;

			item.setReference(ref);
			item.itemID = id;


			if(ref.data){
				item.data = {...ref.data, ...item.data};
			}

			if(data) item.data = {...item.data, ...data};


			return item;
		}
		return null;
	}

	static craftable(){
		return this.items.filter(i => i.item.craftable);
	}

	static gemEnchant(item1: ItemData, item2: ItemData){
		if(!item1 || !item2) return false;
		if(item2.reference.item?.gem
		  && (item1.reference?.item.gems !== false)
		  && !(item1.reference.item?.exclude_gems || []).includes(item2.itemID)){

			return {
				item: item1,
				quantity: item1.quantity
			};
		}
		return false;
	}

	static fromRecipe(preview = false, tool: string, ...items: ItemData[]): { quantity: number, recipe: { item: string, quantity: number }[], item: ResourceSchema, items?: ItemData[], tool: string } | null {
		const itemsIDs = items.map(item => item.itemID).sort();
		let item = this.craftable().find(i =>
			{
				const itemsIds = [...itemsIDs];
				const itemsr = i!.crafting.recipe.map(r => r.item).sort();
				if(itemsIds.length < itemsr.length) itemsIds.push('empty');
				else if(itemsIds.length > itemsr.length) itemsIds.indexOf('empty') ? itemsIds.splice(itemsIds.indexOf('empty')) : null;
				return itemsr.join(',') === itemsIds.sort().join(',')
			}
		);

		
		if(tool == 'brush') item = items[0].reference;

		if (!item) return null;

		const recipe = tool == 'brush' ? {} : item!.crafting.recipe.map(r => ({ quantity: 1, ...r }));

		if(tool != 'brush' && item!.crafting.tool !== tool && item!.crafting.tool !== 'any')
			return null;

		const quantity = tool == 'brush' ? 1 : item!.crafting.quantity;

		if(tool !== 'brush') for (const { item: recipeItem, quantity: recipeItemCount } of recipe) {
			if(recipeItem == 'empty') continue;
			const item = items.find(i => i.itemID === recipeItem);
			if (!item || item.quantity < recipeItemCount) return null;
		}

		return {
			quantity,
			recipe,
			item,
			items: preview ? [] : items,
			tool
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

				if(tool !== 'brush') for (const { item: recipeItem, quantity: recipeItemCount } of recipe.recipe) {
					if(recipeItem == 'empty') continue;
					const item = recipe.items!.find(i => i.itemID === recipeItem);
					if(!item?.reference.item?.isTool) entity.removeFromInventory(item!, recipeItemCount);
				}

				if(tool !== 'brush') entity.addToInventory(Items.create(recipe.item.manifest.id, recipe.quantity)!);
				
				if(tool == 'brush'){
					entity.inventory = entity.inventory.map(i => {
						if(i.id == items[0].id){
							i.data.brush_color = items[0].options.brushColor || "#000000";
							console.log(i.data, items[0].options);
						}
						return i;
					});
				}

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