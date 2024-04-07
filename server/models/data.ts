import { jsonres } from "./jsonres";

export class ServerData {
	id: string; // Unique identifier for the data
	createdAt: Date; // Date and time when the data was created
	updatedAt: Date; // Date and time when the data was last updated

	reference!: jsonres;

	constructor() {
		this.id = '';
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	updateTimestamp() {
		this.updatedAt = new Date();
	}

	setReference(reference: Record<string, any>){
		this.reference = reference as any;
	}

	static from(data: object, args?: any[]) {
		// @ts-ignore
		let d = new this(...(args || []));
		for(let i in data){
			if(i in d) d[i] = data[i];
		}
		return d;
	}
}
