import { ProjectileData } from "../../../server/models/projectile.js";
export class Projectile extends ProjectileData {
    setPosition(newPosition) {
        this.position = newPosition;
        this.object3d.position.set(newPosition.x, newPosition.y, newPosition.z);
    }
}
