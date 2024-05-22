import { ServerData } from "./data.js";
export class ItemData extends ServerData {
    constructor() {
        super(...arguments);
        this.quantity = 0;
        this.itemID = "";
        this.max = 1;
        this.data = {};
        this.class = "common";
        this.flags = ['item'];
    }
}
