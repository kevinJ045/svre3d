
export type Setting = {
	title?: string,
	category?: string,
	min?: number,
	max?: number,
	value: boolean | number | string | object,
	unit?: string
};
export class Settings {

	static settings: Record<string, Setting> = {
		renderDistance: {
			value: 4
		},
		sensitivity: {
			value: 3
		},
		enablePixels: {
			value: false
		},
		pixelLevel: {
			value: 2
		},
		enableBloom: {
			value: true
		},
		ssao: {
			value: false
		},
		fog: {
			value: true
		}
	};

	private static _eventListeners: {type:string,f:CallableFunction}[] = [];
	static on(type:string,f:CallableFunction){
		this._eventListeners.push({type, f});
		return this;
	}
	static emit(type:string,...args: any[]){
		this._eventListeners
		.filter(e => e.type == type)
		.forEach(e => e.f(...args));
		return this;
	}

	static new(key: string, setting: Setting){
		this.settings[key] = setting;
		this.emit('new', { [key]: setting.value });
		return this;
	}

	static type(key: string){
		let val = this.get(key);
		if(typeof val == "number"){
			return val.toString().includes('.') ? 'float' : 'int';
		} else {
			return typeof val == 'boolean' ? 'bool' : typeof val;
		}
	}

	static get<T = any>(key: string, defaultValue?: T){
		return (Settings.getFull(key).value ?? defaultValue) as T;
	}

	static getFull(key: string){
		return Settings.settings[key] || {};
	}

	static set(key: string, value: any, notify = true){
		if(!Settings.settings[key]) Settings.settings[key] = { value };
		else Settings.settings[key].value = value;
		// console.log('set', key, value);
		if(notify){
			this.emit('change', { [key]: value });
			this.emit('change:'+key, value);
		}
		return this;
	}

	static setMap(map: Record<string, any>){
		for(let i in map){
			this.set(i, map[i]);
		}
		return this;
	}

}