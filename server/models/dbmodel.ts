import { v4 } from "uuid";
import { PlayerModel } from "./player";

export class DBModel {

	static copy<T = Record<string, any>, D = Record<string, any>, E = D>(
		model: D,
		instance: E
	){
		return {...model, ...instance, id: v4() } as T;
	}

	static models = {};
	static register(name: string, model: Record<string, any>){
		DBModel.models[name] = model;
		return this;
	}

	static create<T = Record<string, any>>(name: string, instance: T){
		return DBModel.copy<T, T>(
			DBModel.models[name] || {},
			instance
		);
	}

}


DBModel.register('player', PlayerModel);