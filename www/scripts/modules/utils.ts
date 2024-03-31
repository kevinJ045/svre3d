


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
}