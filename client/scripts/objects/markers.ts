import { xyz } from "../../../server/models/misc.xyz.js";
import { SceneManager } from "../common/sceneman.js";
import { Chunk } from "../models/chunk.js";
import { THREE } from "enable3d";
import { PlayerInfo } from "../repositories/player.js";
// import { randomHexColor } from "../common/colors.js";
import { WorldData } from "../world/data.js";
import { Settings } from "../settings/settings.js";
import { Random } from "../../../server/common/rand.js";


function randomHexColor() {
  return '#' + Random.from(0, 16777215).toString(16);
}


export type Marker = {
  position: xyz,
  chunk?: Chunk,
  object3d?: THREE.Object3D,
  line?: THREE.Line,
  color?: string
}

export default class Markers {
  static markers: Marker[] = [];

  static add(marker: Marker) {

    if (!marker.color) marker.color = randomHexColor();

    // Create the marker object
    const markerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: marker.color || 0xFFFFFF });
    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);

    markerMesh.position.set(marker.position.x, marker.position.y, marker.position.z);
    SceneManager.scene.scene.add(markerMesh);

    // Create the line
    const lineMaterial = new THREE.LineBasicMaterial({ color: marker.color || 0xFFFFFF });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeometry, lineMaterial);

    SceneManager.scene.scene.add(line);

    marker.object3d = markerMesh;
    marker.line = line;
    Markers.markers.push(marker);
  }

  static findByPosition(position: xyz) {
    return Markers.markers.find(marker => marker.position.x == position.x && marker.position.y == position.y && marker.position.z == position.z);
  }

  static remove(marker: Marker) {
    const found = this.findByPosition(marker.position);
    if (found) {
      Markers.markers.splice(Markers.markers.indexOf(found), 1);
      SceneManager.scene.scene.remove(found.object3d!);
      SceneManager.scene.scene.remove(found.line!);
    }
  }

  static update() {
    Markers.markers.forEach(marker => {
      if (marker.object3d) {
        marker.object3d.position.set(marker.position.x, marker.position.y, marker.position.z);

        // Update the color if it has changed
        const material = (marker.object3d as any).material as THREE.MeshBasicMaterial;
        if (material.color.getHexString() !== (marker.color || 'FFFFFF').replace('#', '')) {
          material.color.set(marker.color || 0xFFFFFF);
        }

        // Update the line
        if (marker.line) {
          const playerPosition = PlayerInfo.entity.object3d.position;
          const direction = new THREE.Vector3().subVectors(marker.object3d.position, playerPosition).normalize();
          const endPoint = new THREE.Vector3().copy(playerPosition).add(direction.multiplyScalar(WorldData.get('chunkSize') * (Settings.get('renderDistance') as any)));

          const positions = marker.line.geometry.attributes.position.array as Float32Array;
          positions[0] = playerPosition.x;
          positions[1] = playerPosition.y;
          positions[2] = playerPosition.z;
          positions[3] = endPoint.x;
          positions[4] = endPoint.y;
          positions[5] = endPoint.z;
          marker.line.geometry.attributes.position.needsUpdate = true;
        }
      }
    });
  }
}
