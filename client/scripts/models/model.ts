


export class Model {

	static from(data: object, args?: any[]) {
		// @ts-ignore
		let d = new this(...(args || []));
		for(let i in data){
			d[i] = data[i];
		}
		return d;
	}
}