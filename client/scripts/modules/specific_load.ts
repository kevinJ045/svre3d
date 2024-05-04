import { item } from "./models/item.js";
import { THREE } from "enable3d";

const colors = [
	0x00ffff,
	0xff0000,
	0x00ff00,
	0x0000ff,
	0xffff00
]


export const specific_load = {
	"m:segment": (item: item) => {
		item.mesh = item.mesh!.children[0]

		// item.mesh.children.forEach((i, ind) => {

		// 	(i as any).material = new THREE.MeshBasicMaterial({
		// 		color: colors[ind]
		// 	})

		// });

		return item;
	}
}