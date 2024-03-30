import { Scene3D } from "enable3d";
import { item } from "./item";

export class CustomScene extends Scene3D {
  loaded: Record<string, item> = {};
}