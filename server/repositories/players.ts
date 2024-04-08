




export class Players {

	static players = [
		{ username: 'makano', position: { x: 0, y: 0, z: 0 }, inventory: ['m:horn-1'] }
	];

	static async find(username: string){
		return Players.players.find(player => player.username == username);
	}

}