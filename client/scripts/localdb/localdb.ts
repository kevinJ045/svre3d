


export class LocalDB {

	static cookie = class Cookie {
		static getCookieJson(){
			if(!document.cookie) document.cookie = '{}';
			return JSON.parse(document.cookie);
		}
	
		static setCookieJson(object){
			document.cookie = JSON.stringify(object);
			return object;
		}
		
		static set(key, value){
			const object = LocalDB.cookie.getCookieJson();
			object[key] = typeof value == "object" ? JSON.stringify(value) : value;
			LocalDB.cookie.setCookieJson(object);
			return this;
		}
	
		static get(key: string){
			return LocalDB.cookie.getCookieJson()[key];
		}
	
		static remove(key){
			const object = LocalDB.cookie.getCookieJson();
			delete object[key];
			LocalDB.cookie.setCookieJson(object);
			return this;
		}
	}

}