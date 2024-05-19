import { xyz, xyzTv } from "../../client/scripts/common/xyz.ts";
import { generateUniqueId } from "../../client/scripts/modules/bid.ts";
import { EntityData } from "../models/entity.ts";
import { ProjectileData } from "../models/projectile.ts";
import { Sockets } from "../ping/sockets.ts";
import { Vector3 } from 'three';
import { pingFrom } from "../ping/ping.ts";
import { ServerData } from "../models/data.ts";

export default class Projectiles {
  static projectiles: ProjectileData[] = [];

  static createProjectile(owner: EntityData, direction: Vector3, speed: number, damage: number, objectId: string, maxDistance = 0) {
    const position = new Vector3(owner.position.x, owner.position.y, owner.position.z);
    const projectile = ServerData.create(ProjectileData, {
      position, direction: xyzTv(direction).normalize(), speed, damage, owner: owner.id, objectId,
      startPosition: position.clone(), maxDistance
    });
    this.projectiles.push(projectile);
    Sockets.emit('projectile:create', projectile);
    return projectile;
  }

  static moveProjectiles(entities: EntityData[]) {
    this.projectiles.forEach(projectile => {
      projectile.position.add(projectile.direction.clone().multiplyScalar(projectile.speed));
      Sockets.emit('projectile:move', {
        id: projectile.id,
        position: projectile.position
      });

      

      // Check for collision with entities
      const hitEntity = entities.find(entity => entity.id !== projectile.owner && xyzTv(entity.position).distanceTo(projectile.position) < 2);
      if (hitEntity) {
        this.handleProjectileHit(projectile, hitEntity);
      } else if(projectile.maxDistance){
        if(projectile.maxDistance > 1 && xyzTv(projectile.startPosition).distanceTo(projectile.position) >= (projectile.maxDistance)) {
          this.handleProjectileHit(projectile);
        }
      }
    });

    // Remove projectiles that have hit an entity or left the game bounds
    this.projectiles = this.projectiles.filter(projectile => !projectile.hit);
  }

  static directDamageEntity(target: EntityData, damage: number) {

  }

  static handleProjectileHit(projectile: ProjectileData, target?: EntityData) {
    if(target) this.directDamageEntity(target, projectile.damage);
    projectile.hit = true; // Mark projectile for removal
    this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
    Sockets.emit('projectile:hit', {
      id: projectile.id,
      target: target?.id,
      damage: projectile.damage
    });
    projectile.emit('hit', { target });
  }


  static startPing(socket: any, entities: EntityData[]) {
    pingFrom(socket, 'projectile:create', ({ direction, speed, damage, owner, objectId, maxDistance }) => {
      owner = entities.find(i => i.id == owner);
      this.createProjectile(owner, direction, speed, damage, objectId, maxDistance);
    });
  }
}