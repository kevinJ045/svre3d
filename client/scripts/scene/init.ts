import { PhysicsLoader, Project } from "enable3d";
import { MainScene } from "./scene";
import { ResourceMap } from "../repositories/resources";
import { Chunks } from "../repositories/chunks";
import { Items } from "../repositories/items";
import { Entities } from "../repositories/entities";


let started = false;
export async function initScene(){
	if(started) return;
	started = true;
	PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }));


	// @ts-ignore
	window.ResourceMap = ResourceMap;
	// @ts-ignore
	window.Entities = Entities;
	// @ts-ignore
	window.Chunks = Chunks;
	// @ts-ignore
	window.Items = Items;
}