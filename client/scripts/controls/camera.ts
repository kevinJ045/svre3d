import { THREE } from "enable3d";
import { PlayerInfo } from "../repositories/player.js";


export class CameraManager {

	static camera: THREE.Camera;

	static setCamera(camera: THREE.Camera){
		this.camera = camera;
	}

	static cameraPosition : { offset: THREE.Vector3, diagonal: number, lookat: THREE.Vector3 | false, angles: THREE.Vector3[], current: number } = {
    offset: new THREE.Vector3(15, 15, -15),
    diagonal: 10,
    lookat: false,
    angles: [
      new THREE.Vector3(15, 15, -15),
      new THREE.Vector3(15, 15, 15),
      new THREE.Vector3(-15, 15, 15),
      new THREE.Vector3(-15, 15, -15),
      new THREE.Vector3(15, 15, 0),
      new THREE.Vector3(-15, 15, 0),
    ],
    current: 0
  };

  static changeCameraAngle(){
    if(CameraManager.cameraPosition.lookat) return;
    CameraManager.cameraPosition.current++;
    if(CameraManager.cameraPosition.current >= CameraManager.cameraPosition.angles.length) CameraManager.cameraPosition.current = 0;
    CameraManager.cameraPosition.offset = CameraManager.cameraPosition.angles[CameraManager.cameraPosition.current];
  }

  static lockCameraToObject = true;

  static updateCameraLocation() {
    const playerPosition = PlayerInfo.entity.object3d.position;
    const playerRotation = PlayerInfo.entity.object3d.rotation;

    const offsetVector = CameraManager.cameraPosition.offset.clone();
    if(CameraManager.lockCameraToObject) offsetVector.applyEuler(playerRotation);

    const cameraPosition = new THREE.Vector3().copy(playerPosition).add(offsetVector);
    CameraManager.camera.position.copy(cameraPosition);

    if(CameraManager.cameraPosition.lookat) CameraManager.camera.lookAt(playerPosition.clone().add(CameraManager.cameraPosition.lookat).applyEuler(PlayerInfo.entity.object3d.rotation));
    else CameraManager.camera.lookAt(playerPosition);
  }

  static toggleLock(){
    this.lockCameraToObject = !this.lockCameraToObject;
  }

	static update(){
		CameraManager.updateCameraLocation();
	}

}