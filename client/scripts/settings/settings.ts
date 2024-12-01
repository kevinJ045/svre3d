
export type Setting = {
	title?: string,
	category?: string,
	min?: number,
	max?: number,
	value: boolean | number | string | object,
	unit?: string
};
export class Settings {

	static settings: Record<string, Record<string, Setting>> = {
		graphics: {
			_title: { value: 'Graphics' },
			enablePixels: {
				value: false
			},
			pixelLevel: {
				title: 'Pixel Size',
				value: 2,
				min: 2,
				max: 10
			},
			enableBloom: {
				value: true
			},
			ssao: {
				value: false
			},
			fog: {
				value: false
			}
		},
		performance: {
			_title: { value: 'Performance' },
			renderDistance: {
				value: 6,
				min: 2,
				max: 64
			},
			detailsLimit: {
				value: 100,
				min: 10,
				max: 100
			}
		},
		controls: {
			_title: { value: 'Controls' },
			sensitivity: {
				value: 3,
				min: 2,
				max: 50
			},
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
		const group = key.split('.')[0];
		const name = key.split('.')[1];
		this.settings[group] = this.settings[group] || {};
		this.settings[group][name] = setting;
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
		const group = key.split('.')[0];
		const name = key.split('.')[1];
		return Settings.settings[group][name] || {};
	}

	static set(key: string, value: any, notify = true){
		const group = key.split('.')[0];
		const name = key.split('.')[1];
		if(!Settings.settings[group][name]) Settings.settings[group][name] = { value };
		else Settings.settings[group][name].value = value;
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