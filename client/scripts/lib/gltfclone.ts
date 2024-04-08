import { THREE } from "enable3d";
import { clone } from "./SkeletonUtils";


export const cloneGltf = (gltf) => {
  return clone(gltf.scene);
}