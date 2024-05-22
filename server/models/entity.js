import { ServerData } from "./data.js";
class EntityData extends ServerData {
    constructor() {
        super();
        this.inventory = []; // Inventory of the entity
        this.ai = true;
        this.class = "common";
        this.attackInfo = {
            cooldown: 60,
            current: 0
        };
        this.stepOn = "";
        this.flags = ['entity'];
        this.data = {};
        this.restTime = {
            current: 0,
            max: 2000,
            min: 1000,
            currentMax: 1000
        };
        this.init = false;
        this.type = "";
        this.name = "";
        this.position = { x: 0, y: 0, z: 0 };
        this.inventory = [];
        this.variant = "";
        this.state = "Idle";
        this.isNeutral = false;
        this.buffs = [];
        this.health = { max: 1, current: 1 };
    }
    // Method to add an item to the inventory
    addToInventory(item) {
        const existingItem = this.findItemTypeInInventory(item);
        if (existingItem) {
            if (!isNaN(existingItem.quantity))
                existingItem.quantity = parseInt(existingItem.quantity);
            if (!isNaN(item.quantity))
                item.quantity = parseInt(item.quantity);
            if (existingItem.quantity + item.quantity <= existingItem.max) {
                existingItem.quantity += item.quantity;
                return 'increase';
            }
            else {
                const remainingCount = existingItem.max - existingItem.quantity;
                existingItem.quantity = existingItem.max;
                item.quantity -= remainingCount;
                this.inventory.push(item);
                return 'add';
            }
        }
        else {
            this.inventory.push(item);
            return 'add';
        }
    }
    // Method to remove an item from the inventory
    removeFromInventory(item, count = 1) {
        const existingItem = this.findItemTypeInInventory(item);
        if (!existingItem)
            return;
        if (existingItem.quantity > count) {
            existingItem.quantity -= count;
            return 'decrease';
        }
        else {
            this.inventory.splice(this.inventory.indexOf(existingItem), 1);
            return 'remove';
        }
    }
    findItemTypeInInventory(item) {
        return this.inventory.find(i => i.itemID === item.itemID);
    }
    findItemInInventory(item) {
        return this.inventory.find(i => i.id === (typeof item == "string" ? item : item.id));
    }
    findItemByData(key, value) {
        return this.inventory.find(i => i.data[key] == value);
    }
}
export { EntityData };
