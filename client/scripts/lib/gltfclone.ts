import { THREE } from "enable3d";
import { clone } from "./SkeletonUtils.js";


export const cloneGltf = (gltf) => {
  return clone(gltf.scene);
}