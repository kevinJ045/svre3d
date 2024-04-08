import { ExtendedObject3D } from "enable3d";
import { ItemData } from "../../../server/models/item";


export class Item extends ItemData {
	object3d!: ExtendedObject3D;

	// increase(){}
}