import { MongoClient } from "mongodb";
export class Data {
    static async connect(uri) {
        this.client = new MongoClient(uri);
        await this.client.connect();
        this.initDb();
    }
    static initDb() {
        this.db = this.client.db('main');
    }
    static collection(name) {
        return this.db.collection(name);
    }
}
