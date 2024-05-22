import { Item } from "./models/item2.js";
export class ItemMan {
    constructor(scene) {
        this.worldItems = [];
        this.items = [];
        this.scene = scene;
    }
    loadItems() {
        this.scene.loaded['objects']
            .filter((item) => item.config?.item == true || item.accessory?.type == 'brow')
            .forEach((item) => {
            this.items.push(item);
        });
    }
    craftable() {
        return this.items.filter(i => i.config?.crafting);
    }
    itemFromName(name) {
        let item = this.items.find(i => i.id == name);
        if (!item)
            return null;
        return new Item(item);
    }
    fromRecipe(item1, item2) {
        const item = this.craftable().find(i => i.config.crafting.recipe.map(i => i.item).join(',') == [item1.item.id, item2.item.id].join(','));
        if (!item)
            return null;
        const recipe = item.config.crafting.recipe.map(r => ({ count: 1, ...r }));
        const count = item.config.crafting.count;
        if (item1.count < recipe[0].count || item2.count < recipe[1].count)
            return null;
        return {
            count,
            recipe,
            item
        };
    }
}
