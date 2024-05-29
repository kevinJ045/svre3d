import { THREE } from "enable3d";

export default class CommonUtils {

  static getObjectSize(object: THREE.Object3D){
    const box = new THREE.Box3().setFromObject(object);
    const sizeParent = new THREE.Vector3();
    box.getSize(sizeParent);
    return sizeParent;
  }

}