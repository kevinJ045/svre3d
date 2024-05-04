import { DBModel } from "./dbmodel.ts";
import { ItemDBModel } from "./item.db.ts";


export const PlayerModel = {
	username: "",
	position: { x: 0, y: 0, z: 0 },
	variant: "grass",
	equipment: { brow: 'm:brow-1' },
	inventory: [],
	settings: {
		renderDistance: 4,
		sensitivity: 3
	},
	exp: {
		level: 1,
		max: 100,
		current: 1,
	},
	spawnPoint: { x: 0, z: 0 }
} as {
	username: string;
	position: { x?: number, y?: number, z?: number },
	variant: string,
	equipment: { [key: string]: any },
	inventory: (typeof ItemDBModel)[],
	settings: { [key: string]: any },
	exp: {
		level: number;
		max: number;
		current: number;
	}
}

