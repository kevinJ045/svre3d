import { THREE } from "enable3d";
import { PlayerInfo } from "../repositories/player.js";
export class CameraManager {
    static setCamera(camera) {
        this.camera = camera;
    }
    static changeCameraAngle() {
        if (CameraManager.cameraPosition.lookat)
            return;
        CameraManager.cameraPosition.current++;
        if (CameraManager.cameraPosition.current >= CameraManager.cameraPosition.angles.length)
            CameraManager.cameraPosition.current = 0;
        CameraManager.cameraPosition.offset = CameraManager.cameraPosition.angles[CameraManager.cameraPosition.current];
    }
    static updateCameraLocation() {
        const playerPosition = PlayerInfo.entity.object3d.position;
        const playerRotation = PlayerInfo.entity.object3d.rotation;
        const offsetVector = CameraManager.cameraPosition.offset.clone();
        if (CameraManager.lockCameraToObject)
            offsetVector.applyEuler(playerRotation);
        const cameraPosition = new THREE.Vector3().copy(playerPosition).add(offsetVector);
        CameraManager.camera.position.copy(cameraPosition);
        if (CameraManager.cameraPosition.lookat)
            CameraManager.camera.lookAt(playerPosition.clone().add(CameraManager.cameraPosition.lookat).applyEuler(PlayerInfo.entity.object3d.rotation));
        else
            CameraManager.camera.lookAt(playerPosition);
    }
    static toggleLock() {
        this.lockCameraToObject = !this.lockCameraToObject;
    }
    static update() {
        CameraManager.updateCameraLocation();
    }
}
CameraManager.cameraPosition = {
    offset: new THREE.Vector3(15, 15, -15),
    // offset: new THREE.Vector3(0, 3, -5),
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
CameraManager.lockCameraToObject = true;
