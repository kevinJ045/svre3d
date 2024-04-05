


export class Utils {
	static async lsDir(dir: string) : Promise<string[]> {
		return fetch('/lsdir/res/'+dir)
		.then(r => r.json());
	}

	static async loadJson(file: string) : Promise<any> {
		return fetch('/res/'+file)
		.then(r => r.json());
	}

	static async loadText(file: string) : Promise<any> {
		return fetch(file)
		.then(r => r.text());
	}

	static async dirToJson(dir: string) : Promise<any> {
		const files = await Utils.lsDir(dir);
		if(!dir.endsWith('/')) dir += '/';
		const parsed: any[] = [];
		for(let file of files){
			try{
				parsed.push(await this.loadJson(dir+file));
			} catch(e){
				console.log(e);
			};
		}
		return parsed;
	}

	static randFrom(min, max, seed?: any){
		const r = (seed ? seed() : Math.random());
		return Math.floor(r*(max-min+1)+min);
	}

	static pickRandom(...items){
		let r = null;
		if(typeof items[items.length-1] == "function" && typeof items[0] !== "function"){
			r = items.pop();
		}
		return items[this.randFrom(0, items.length-1, r)];
	}
}