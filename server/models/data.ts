import { ResourceSchema } from "../lib/loader/Schema.type.js";
import { jsonres } from "./jsonres.js";
import * as uuid from 'uuid';

export class ServerData {
	id: string; // Unique identifier for the data
	createdAt: Date; // Date and time when the data was created
	updatedAt: Date; // Date and time when the data was last updated

	reference!: ResourceSchema;

	flags: string[] = [];
	data: any;

	constructor() {
		this.id = uuid.v4();
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	updateTimestamp() {
		this.updatedAt = new Date();
	}

	setReference(reference: Record<string, any>){
		this.reference = reference as any;
		return this;
	}

	setData<T = any>(data: T){
		const d = this as any;
		for(let i in data){
			if(data[i] !== null) d[i] = data[i];
		}
		return this;
	}

	clone(customprops){
		return new (this.constructor as any)().setData({
			...this,
			...customprops
		});
	}

	static from(data: object, args?: any[]) {
		// @ts-ignore
		let d = new this(...(args || []));
		d.setData(data);
		return d;
	}

	static create<T extends ServerData = ServerData>(model: new () => T, data: object, args?: any[]) {
		// @ts-ignore
		let d = new model(...(args || []));
		d.setData(data);
		return d;
	}


	private _eventListeners: {type:string,f:CallableFunction}[] = [];
	on(type:string,f:CallableFunction){
		this._eventListeners.push({type, f});
		return this;
	}
	emit(type:string,...args: any[]){
		this._eventListeners
		.filter(e => e.type == type)
		.forEach(e => e.f(...args));
		return this;
	}
}
