import { Data } from "../db/db";





export class Players {

	static active: string[] = [];

	static async find(username: string){
		return await Data.collection('players').findOne({ username });
	}

	static isActive(username: string){
		return Players.active.includes(username);
	}

	static addActive(username: string){
		return Players.active.push(username);
	}

	static removeActive(username: string){
		return Players.active.splice(Players.active.indexOf(username), 1);
	}



	static setPlayerData(username: string, data: any){

	}

}