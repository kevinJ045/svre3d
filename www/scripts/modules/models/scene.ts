import { ExtendedGroup, ExtendedObject3D, Scene3D, ThirdPersonControls } from "enable3d";
import { item } from "./item";
import { ChunkSet } from "../world";
import { UI } from "../ui";
import { Entity } from "../entity";
import { generateUniqueId } from "../bid";
import { Player } from "../player";

export class CustomScene extends Scene3D {
  loaded: Record<string, item[]> = {};
  controls!: ThirdPersonControls;
  world!: ExtendedObject3D;

  entities: Entity[] = [];


  lightSet!: {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
    hemisphereLight: THREE.HemisphereLight;
  };

  chunkSize = 5;
  maxWorldHeight = 4;
  renderDistance = 8;
  seed = generateUniqueId().toString();

  loadedChunks!: ChunkSet;

  UI = new UI;


  firstPersonMode = false;


  loader!: Promise<any>
  player!: Player
  keys: Record<string, boolean> = {};

  pointerLock: any;

  findLoadedResource(name: string, type = "", defaultResource = "none"){
    return this.loaded[type].find(i => i.id == name) || this.loaded[type].find(i => i.id == name);
  }
}