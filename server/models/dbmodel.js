import { v4 } from "uuid";
import { PlayerModel } from "./player.js";
export class DBModel {
    static copy(model, instance) {
        return { ...model, ...instance, id: v4() };
    }
    static register(name, model) {
        DBModel.models[name] = model;
        return this;
    }
    static create(name, instance) {
        return DBModel.copy(DBModel.models[name] || {}, instance);
    }
}
DBModel.models = {};
DBModel.register('player', PlayerModel);
