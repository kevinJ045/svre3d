import { ResourceSchema } from "../lib/loader/Schema.type.ts";
import { jsonres } from "./jsonres.ts";
import * as uuid from 'uuid';

export class ServerData {
	id: string; // Unique identifier for the data
	createdAt: Date; // Date and time when the data was created
	updatedAt: Date; // Date and time when the data was last updated

	reference!: ResourceSchema;

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
}
