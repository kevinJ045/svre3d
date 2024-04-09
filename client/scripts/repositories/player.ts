import { Entity } from "../models/entity";
import { ping } from "../socket/socket";
import { Equipments } from "./equipments";

export interface PlayerLike {
	username: string,
	position: { x: number, y: number, z: number },
	inventory: string[],
	equipment: {
		brow: string
	}
}

export class PlayerInfo {

	static player: PlayerLike = {
		username: "",
		position: { x:0, y:0, z:0 },
		inventory: [],
		equipment: {
			brow: 'brow-1'
		}
	}

	static entity: Entity;

	static setPlayer(player: PlayerLike){
		this.player = player;
	}	

	static setPlayerEntity(entity: Entity){
		this.entity = entity;
	}	

	static get username(){
		return this.player.username;
	}

	static get inventory(){
		return this.player.inventory;
	}

	static get position(){
		return this.player.position;
	}


	static updateEquipmentData(){
		const equipment = {};

		for(let i in PlayerInfo.entity.data.equipment){
			if(i == 'brow'){
				equipment[i] = Equipments.brows[PlayerInfo.entity.data.equipment[i]];
			} else {
				equipment[i] = PlayerInfo.entity.findItemByData('wid',
					PlayerInfo.entity.data.equipment[i]
				)?.data.wid;
			}
		}
		
		ping('player:equipment', {
			inventory: PlayerInfo.entity.inventory.map(i => ({ itemID: i.itemID, data: i.data, quantity: i.quantity, id: i.id })).filter(i => i.data.wid),
			equipment,
			username: PlayerInfo.username
		});
	}
}