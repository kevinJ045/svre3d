import { Vector3 } from 'three';
import { ServerData } from './data.js';

export class ProjectileData extends ServerData {
  position: Vector3;
  startPosition: Vector3;
  direction: Vector3;
  maxDistance = 0;
  speed: number;
  damage: number;
  owner!: string; // The entity that shot the projectile

  hit = false;

  objectId: string;

  constructor() {
    super();
    this.startPosition = new Vector3();
    this.position = new Vector3();
    this.direction = new Vector3();
    this.speed = 1;
    this.damage = 1;
    this.objectId = '';
  }
}
