




export class Players {

	static players = [
		{ username: 'makano', position: { x: 0, y: 0, z: 0 }, variant: 'grass', equipment: { brow: 'm:brow-1', hat: '1isd' }, inventory: [{id: 'm:horn-1', quantity: 1, data: { wid: '1isd', corn: 'true' } }] }
	];

	static active: string[] = [];

	static async find(username: string){
		return Players.players.find(player => player.username == username);
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