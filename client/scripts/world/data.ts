

export class WorldData {
	static worldData = {};

	static get(key: string, ifNil?: any){
		return WorldData.worldData[key] || ifNil;
	}

	static set(key: string, value: any){
		WorldData.worldData[key] = value;
		return this;
	}

	static setData(data: Record<string, any>){
		for(let i in data){
			this.set(i, data[i]);
		}
		return this;
	}
}