import { PhysicsLoader, Project } from "enable3d";
import { MainScene } from "./scene.js";
import { ResourceMap } from "../repositories/resources.js";
import { Chunks } from "../repositories/chunks.js";
import { Items } from "../repositories/items.js";
import { Entities } from "../repositories/entities.js";
import { Seed } from "../world/seed.js";
import { PlayerInfo } from "../repositories/player.js";


export async function initScene(){
	PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }));

	// @ts-ignore
	window.ResourceMap = ResourceMap;
	// @ts-ignore
	window.Entities = Entities;
	// @ts-ignore
	window.Chunks = Chunks;
	// @ts-ignore
	window.Items = Items;
	// @ts-ignore
	window.Seed = Seed;
	// @ts-ignore
	window.PlayerInfo = PlayerInfo;
}