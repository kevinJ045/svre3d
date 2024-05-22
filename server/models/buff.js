import { ServerData } from "./data.js";
export class BuffData extends ServerData {
    constructor() {
        super(...arguments);
        this.type = "";
        this.amount = "";
    }
}
