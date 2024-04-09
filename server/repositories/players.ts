import { Data } from "../db/db";
import { Entities } from "./entities";





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

	static startPing(socket){

		socket.on('player:inventory', ({
			inventory,
			username
		}) => {

			Data
				.collection('players')
				.updateOne({
					username
				}, {
					$set: { inventory }
				})
		});

		socket.on('player:equipment', ({
			inventory,
			equipment,
			username
		}) => {			

			Data
				.collection('players')
				.updateOne({
					username
				}, {
					$set: {
						inventory: Entities.entities.find(i => i.data.username == username)!.inventory
						.filter(i => !inventory.find(i2 => i2.id == i.id))
						.map(i => ({ id: i.itemID, quantity: i.quantity, data: i.data }))
						.concat(inventory.map(i => ({ id: i.itemID, quantity: i.quantity, data: i.data }))),
						equipment
					}
				})
			
		});

	}

}