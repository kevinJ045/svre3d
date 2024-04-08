import { BuffData } from "./buff";
import { ServerData } from "./data";
import { ItemData } from "./item";

class EntityData extends ServerData {
    // Entity-specific properties
    type!: string; // Type of the entity
    position: { x: number; y: number; z: number }; // Position of the entity
    health!: { max: number; current: number }; // Health of the entity
    speed!: number; // Speed of the entity
    defense!: number; // Defense of the entity
    damage!: number; // Damage of the entity
    attackTarget!: string | null; // ID of the entity's attack target, if any
    targetPosition!: { x: number; y: number; z: number } | null; // Target position of the entity
    exp!: {
        level: number;
        max: number;
        current: number;
        multipliers: {
            damage: number;
            defense: number;
            health: number;
        };
    };
    inventory: ItemData[] = []; // Inventory of the entity
    variant: string; // Variant of the entity (if applicable)
    isNeutral: boolean; // Indicates if the entity is neutral (does not attack)
    buffs: BuffData[]; // Buffs or status effects applied to the entity
    name: string; // Entity name
    state: string; // Entity state, Like Running, Idle....

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
    }
}

export { EntityData };
