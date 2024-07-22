import { ExtendedObject3D } from "enable3d";
import { ItemData } from "../../../server/models/item.js";
import { ping } from "../socket/socket.js";


export class Item extends ItemData {
	object3d!: ExtendedObject3D;
}