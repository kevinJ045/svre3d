import { PhysicsLoader, Project } from "enable3d";
import { MainScene } from "./scene";

export async function initScene(){

	PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }));
}