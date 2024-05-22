import { Entities } from "../../repositories/entities.js";
export default class CoffeeContext {
    constructor(packageData, serverData) {
        this.context = {};
        const ctx = this.context;
        ctx.World = {
            find: {
                user: (username) => Entities.entities.find(i => i.data.username == username),
                id: (id) => Entities.entities.find(i => i.id == id),
                type: (type) => Entities.entities.filter(i => i.reference.manifest.id == type)
            },
            on: (event, f) => serverData.on(event, (data) => f(data))
        };
        ctx.Registry = {
            register: (data) => packageData.data.push(data)
        },
            ctx.sleep = (time) => new Promise((r) => setTimeout(r, time));
    }
}
