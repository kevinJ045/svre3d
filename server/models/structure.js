import { ServerData } from "./data.js";
export class StructureData extends ServerData {
    constructor() {
        super(...arguments);
        this.type = "";
        this.looted = false;
        this.object3d = null;
    }
}
