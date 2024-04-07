import { ExtendedGroup, ExtendedObject3D, Scene3D, ThirdPersonControls } from "enable3d";
import { item } from "./item";
import { ChunkSet } from "../world";
import { UI } from "../ui";
import { Entity } from "../entity";
import { generateUniqueId } from "../bid";
import { Player } from "../player";
import { Entities } from "../entityman";
import { Item } from "./item2";
import { ParticleSystem } from "../particle";
import { ItemMan } from "../items";

export class CustomScene extends Scene3D {
  loaded: Record<string, item[]> = {};
  controls!: ThirdPersonControls;
  world!: ExtendedObject3D;

  entities!: Entities;


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
  particleSystem!: ParticleSystem;
  items!: ItemMan;

  UI = new UI;


  firstPersonMode = false;


  loader!: Promise<any>
  player!: Player
  keys: Record<string, boolean> = {};

  pointerLock: any;

  findLoadedResource(name: string, type = "", defaultResource = "none"){
    return this.loaded[type].find(i => i.id == name) || this.loaded[type].find(i => i.id == name);
  }

  loadedObject(name: string) : item {
    return this.findLoadedResource(name, 'objects')!;
  }

  private EventListeners: {evt: string, f: CallableFunction}[] = [];
  on(evt: string, f: CallableFunction){
    this.EventListeners.push({evt,f});
    return this;
  }

  emit(evt: string, data: any){
    this.EventListeners.filter(e => e.evt == evt)
    .forEach(e => e.f(data));
    return this;
  }
} 