import { ServerData } from "../../../server/models/data.js";
import { ProjectileData } from "../../../server/models/projectile.js";
import { stringifyChunkPosition } from "../common/chunk.js";
import { SceneManager } from "../common/sceneman.js";
import { xyzTv } from "../common/xyz.js";
import { Projectile } from "../models/projectile.js";
import { pingFrom } from "../socket/socket.js";
import { THREE } from "enable3d";
import { Entities } from "./entities.js";



export default class Projectiles {

  static projectiles: Projectile[] = [];

  static createProjectile(projectileData: ProjectileData){
    const projectile = ServerData.create(Projectile, {
      ...projectileData,
      direction: xyzTv(projectileData.direction),
      position: xyzTv(projectileData.position)
    });
    // console.log(projectile);

    projectile.object3d = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: '#ff00ff' })
    );

    projectile.object3d.position.set(
      projectile.position.x,
      projectile.position.y,
      projectile.position.z
    );

    SceneManager.scene.add.existing(projectile.object3d);

    this.projectiles.push(projectile);
  }

  static moveProjectile(id: string, position: any){
    const projectile = this.projectiles.find(i => i.id == id);
    // projectile?.setPosition(position);
  }

  static ping(){

    pingFrom('projectile:create', (projectile) => {
      Projectiles.createProjectile(projectile);
      const owner = Entities.find(projectile.owner.id || projectile.owner);
      if(owner){
        owner.position = projectile.owner.position;
        owner.object3d.position.set(
          projectile.position.x,
          projectile.position.y,
          projectile.position.z
        )
      }
    });

    pingFrom('projectile:hit', (projectile) => {
      const p = this.projectiles.find(i => projectile.id == i.id);
      if(!p) return;
      this.projectiles.splice(this.projectiles.indexOf(p), 1);
      SceneManager.scene.scene.remove(p.object3d);
    });

  } 

  static update(){
    this.projectiles.forEach(projectile => {
      projectile.position.add(projectile.direction.clone().multiplyScalar(projectile.speed));
      projectile.object3d.position.add(projectile.direction.clone().multiplyScalar(projectile.speed));
    });
  }

}