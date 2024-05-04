import { ServerData } from "../../../server/models/data.js";
import { ItemData } from "../../../server/models/item.js";
import { SceneManager } from "../common/sceneman.js";
import { Item } from "../models/item.js";
import { ping } from "../socket/socket.js";
import { PlayerInfo } from "./player.js";
import { ResourceMap } from "./resources.js";
import { THREE } from "enable3d";



export class Items {

	static create(itemData: ItemData){

		const item = ServerData.create(Item, itemData);

		const ref = ResourceMap.find(item.itemID)!;

		console.log(ref, item.itemID);

		item.setReference(ref);
		item.max = ref.item.inventory?.max || 1;

		return item;
	}

	private static crafting_request: any;
	static crafting(recipe = true, tool: string, ...items: Item[]){
		if(this.crafting_request) Promise.resolve(this.crafting_request);
		this.crafting_request = ping('crafting:'+(recipe ? 'recipe' : 'craft'), {entity: PlayerInfo.entity.id, tool, items:items.map(i => ({ itemID: i.itemID, max: i.max, quantity: i.quantity, id: i.id, options: (i as any).options }))})
		.then((e) => {
			this.crafting_request = null;
			return e;
		});
		return this.crafting_request;
	}

	static all(){
		return  ResourceMap.resources
		.filter(
			i => i.manifest?.type == 'item' && !i.item.hidden
		);
	}


	static startAnimation(item: Item, animationName: string, itemMesh?: any){

		if(!itemMesh) itemMesh = item.object3d;

		const animation = item.reference.load.animations.find(anim => anim.name == animationName);
		if(!animation) return;
		
		const mixer = itemMesh.userData.mixer = new THREE.AnimationMixer(itemMesh);
		SceneManager.scene.animationMixers.add(mixer);
		mixer.timeScale = 1;

		const action = mixer.clipAction(animation);
		action.play();
	}

	static initItemAnimation(item: Item, itemMesh?: any){
		let animation = item.reference.config?.animation;
		if(Array.isArray(animation)){
			animation.forEach(animation => this.startAnimation(item, animation, itemMesh));
		} else {
			this.startAnimation(item, animation, itemMesh);
		}
	}

}