import { THREE } from "enable3d";
import { Player } from "../player.js";
import { item } from "./item.js";



export class Item {
	item: item;
	id: string;
	player?: Player;

	data: Record<string, any> = {};
	mesh?: THREE.Object3D;

	count = 1;
	max = 1;

	name: string = "";

	constructor(item: item){
		this.item = item;

		this.max = item.config?.inventory?.max || 1;

		this.id = THREE.MathUtils.generateUUID();

		this.name = item.config?.name || item.id || "item";

		this.data.content = "";
	}

	setParentPlayer(player: Player){
		this.player = player;
	}

	removeParentPlayer(){
		this.player = undefined;
	}

	updateUi(UI){
		if(this.data.inventory && this.player){
			const el = this.data.inventory as HTMLElement;
			if(this.item.type == "accessory"){
				if((el as any).clickEvent) el.removeEventListener('click', (el as any).clickEvent);
				(el as any).clickEvent = () => {
					if(this.data.worn == true){
						this.player?.unwearAccessory(this);
						this.data.worn = false;
					} else {
						this.player?.wearAccessory(this);
						this.data.worn = true;
					}
				};
				el.addEventListener('click', (el as any).clickEvent);
			}
		}
	}
}