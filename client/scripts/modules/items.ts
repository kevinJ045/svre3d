import { item } from "./models/item.js";
import { Item } from "./models/item2.js";
import { CustomScene } from "./models/scene.js";



export class ItemMan {

	worldItems = [];

	scene: CustomScene;

	constructor(scene: CustomScene){
		this.scene = scene;
	}

	items: item[] = [];

	loadItems(){
		this.scene.loaded['objects']
		.filter((item) => item.config?.item == true || item.accessory?.type == 'brow')
		.forEach((item) => {
			this.items.push(item);
		});
	}

	craftable(){
		return this.items.filter(i => i.config?.crafting);
	}

	itemFromName(name: string){
		let item = this.items.find(i => i.id == name);
    if(!item) return null;
    return new Item(item);
	}
	
	fromRecipe(item1: Item, item2: Item){
		const item = this.craftable().find(i => 
			i.config!.crafting.recipe.map(i => i.item).join(',') == [item1.item.id, item2.item.id].join(',')
		);
		if(!item) return null;
		const recipe = item.config!.crafting.recipe.map(r => ({count: 1,...r}));
		const count = item.config!.crafting.count;

		if(item1.count < recipe[0].count || item2.count < recipe[1].count) return null;

		return {
			count,
			recipe,
			item
		}
	}


}