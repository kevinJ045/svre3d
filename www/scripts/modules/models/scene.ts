import { ExtendedGroup, Scene3D, ThirdPersonControls } from "enable3d";
import { item } from "./item";
import { ChunkSet } from "../world";

export class CustomScene extends Scene3D {
  loaded: Record<string, item> = {};
  controls!: ThirdPersonControls;
  world!: ExtendedGroup;


  lightSet!: {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
    hemisphereLight: THREE.HemisphereLight;
  };

  chunkSize = 5;
  maxWorldHeight = 4;
  renderDistance = 8;
  seed = "joeman";

  loadedChunks!: ChunkSet;


  findLoadedResource(name: string, defaultResource = "none"){
    return this.loaded[name] || this.loaded[defaultResource];
  }
}