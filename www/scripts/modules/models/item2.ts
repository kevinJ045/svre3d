import { THREE } from "enable3d";
import { Player } from "../player";
import { item } from "./item";



export class Item {
	item: item;
	id: string;
	player?: Player;

	data: Record<string, any> = {};
	mesh?: THREE.Object3D;

	constructor(item: item){
		this.item = item;

		this.id = THREE.MathUtils.generateUUID();
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