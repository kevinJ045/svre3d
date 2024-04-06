import { ExtendedObject3D } from "enable3d";
import { CustomScene } from "./models/scene";
import { Item } from "./models/item2";
import { applyMaterials } from "./shaderMaterial";

export class ItemEntity  {

	static createItem(scene: CustomScene, pos: THREE.Vector3, item: Item) {
		const o = new ExtendedObject3D();
		const gmesh = item.item.mesh!.clone(true);
		o.add(gmesh);

		if(item.item.config?.material) applyMaterials(gmesh, item.item.config?.material, scene, {});

		if(pos) o.position.copy(pos);
		scene.add.existing(o);
		scene.physics.add.existing(o, {
			shape: 'concave'
		});

		const rm = () => {
			clearTimeout(t);
			scene.physics.destroy(o.body);
			scene.scene.remove(o);
		}

		o.body.on.collision((otherobject, event) => {
			if(otherobject.name !== "chunk" && otherobject.userData.player){
				otherobject.userData.player.toInventory(item);
				rm();
			}
		});

		const t = setTimeout(rm, 60 * 1000);
	}

}