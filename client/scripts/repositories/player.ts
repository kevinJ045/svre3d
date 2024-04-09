import { Entity } from "../models/entity";

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

}