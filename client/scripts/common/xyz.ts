import { Vector3 } from "three";

export const xyz = Vector3;

export const xyzTv = (xyzv: any) => {
  return new xyz(
    xyzv.x,
    xyzv.y,
    xyzv.z
  );
}

export type xyzt = Vector3;