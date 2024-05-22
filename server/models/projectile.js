import { Vector3 } from 'three';
import { ServerData } from "./data.js";
export class ProjectileData extends ServerData {
    constructor() {
        super();
        this.maxDistance = 0;
        this.hit = false;
        this.startPosition = new Vector3();
        this.position = new Vector3();
        this.direction = new Vector3();
        this.speed = 1;
        this.damage = 1;
        this.objectId = '';
    }
}
