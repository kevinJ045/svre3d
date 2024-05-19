import { ProjectileData } from "../../../server/models/projectile.ts";



export class Projectile extends ProjectileData {
  object3d!: THREE.Mesh;

  setPosition(newPosition) {
    this.position = newPosition;
    this.object3d.position.set(newPosition.x, newPosition.y, newPosition.z);
  }
}