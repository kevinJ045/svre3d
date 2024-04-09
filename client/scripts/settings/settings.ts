

export class Settings {

	static settings = {
		renderDistance: 4,
		sensitivity: 3
	};



	static get(key: string){
		return Settings.settings[key];
	}

	static set(key: string, value: any){
		Settings.settings[key] = value;
		return this;
	}

	static setMap(map: Record<string, any>){
		for(let i in map){
			this.set(i, map[i]);
		}
		return this;
	}

}