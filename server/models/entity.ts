import { BuffData } from "./buff.js";
import { ServerData } from "./data.js";
import { ItemData } from "./item.js";
import { Random } from "../common/rand.js";
import { xyz } from "./misc.xyz.js";


class EntityData extends ServerData {
    // Entity-specific properties
    type!: string; // Type of the entity
    position: { x: number; y: number; z: number }; // Position of the entity
    health!: { max: number; current: number }; // Health of the entity
    speed!: number; // Speed of the entity
    defense!: number; // Defense of the entity
    damage!: number; // Damage of the entity
    attackTarget!: EntityData | null; // ID of the entity's attack target, if any
    exp!: {
        level: number;
        max: number;
        current: number;
    };
    inventory: ItemData[] = []; // Inventory of the entity
    variant: string; // Variant of the entity (if applicable)
    isNeutral: boolean; // Indicates if the entity is neutral (does not attack)
    buffs: BuffData[]; // Buffs or status effects applied to the entity
    name: string; // Entity name
    state: string; // Entity state, Like Running, Idle....
    ai = true;
    class = "common";

    attackInfo = {
        cooldown: 60,
        current: 0
    };

    stepOn: string = "";

    flags: string[] = ['entity'];

	data: Record<string, any> = {};
    constructor() {
        super();
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

    // targetPositionList: xyz[] = [];

    // get targetPosition(){
    //     return this.targetPositionList.length ? this.targetPositionList[0] : null; 
    // }

    // set targetPosition(position: xyz | null){
    //     if(position){
    //         this.targetPositionList.push(position);
    //     } else {
    //         this.targetPositionList.shift();
    //     }
    // }
    targetPosition!: xyz | null;
	// Method to add an item to the inventory
	addToInventory(item: ItemData): void | string {
		const existingItem = this.findItemTypeInInventory(item);
        if (existingItem) {
            if(!isNaN(existingItem.quantity)) existingItem.quantity = parseInt(existingItem.quantity as any);
            if(!isNaN(item.quantity)) item.quantity = parseInt(item.quantity as any);
			if (existingItem.quantity + item.quantity <= existingItem.max) {
				existingItem.quantity += item.quantity;
                return 'increase';
			} else {
				const remainingCount = existingItem.max - existingItem.quantity;
				existingItem.quantity = existingItem.max;
				item.quantity -= remainingCount;
				this.inventory.push(item);
                return 'add';
			}
		} else {
            this.inventory.push(item);
            return 'add';
		}
	}

	// Method to remove an item from the inventory
	removeFromInventory(item: ItemData, count: number = 1): void | string {
		const existingItem = this.findItemTypeInInventory(item);
		if (!existingItem) return;

		if (existingItem.quantity > count) {
            existingItem.quantity -= count;
            return 'decrease';
		} else {
            this.inventory.splice(this.inventory.indexOf(existingItem), 1);
            return 'remove';
		}
		
	}

	findItemTypeInInventory(item: ItemData) {
		return this.inventory.find(i => i.itemID === item.itemID);
	}

    findItemInInventory(item: ItemData | string) {
		return this.inventory.find(i => i.id === (typeof item == "string" ? item : item.id));
	}

    findItemByData(key: string, value: any) {
		return this.inventory.find(i => i.data[key] == value);
	}

    restTime = {
        current: 0,
        max: 2000,
        min: 1000,
        currentMax: 1000
    };

    init = false;
    
}

export { EntityData };
