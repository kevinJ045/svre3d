import { Db, MongoClient } from "mongodb";


export class Data {

	static client: MongoClient;

	static db: Db;

	static async connect(uri: string){
		this.client = new MongoClient(uri);
		await this.client.connect();
		this.initDb();
	}

	static initDb(){
		this.db = this.client.db('main');
	}

	static collection(name: string){
		return this.db.collection(name);
	}


}