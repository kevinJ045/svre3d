import { Goober } from "./goober.js";
import { Player } from "./player.js";
export class Entities {
    constructor(scene) {
        this._entities = {};
        this.entities = [];
        this.scene = scene;
        this.registerAll();
    }
    summon(id, name = '', pos) {
        return this._entities[id].entityMeshLoader(this.scene, name, pos);
    }
    register(id, c) {
        this._entities[id] = c;
    }
    registerAll() {
        this.register('m:player', Player);
        this.register('m:goober', Goober);
    }
    add(entity) {
        this.entities.push(entity);
    }
    remove(entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
        this.entities.forEach(i => {
            if (i.attackTarget && i.attackTarget.id == entity.id)
                i.attackTarget = null;
        });
    }
    allEntities() {
        return this.entities;
    }
    think() {
        this.entities.forEach((entity) => {
            entity.think();
        });
    }
    filter(g) {
        return this.entities.filter(g);
    }
}
