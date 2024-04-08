import { ChunkData } from "../../../server/models/chunk";
import { stringifyChunkPosition } from "../common/chunk";
import { Model } from "./model";


export class Chunk extends ChunkData {

	position!: THREE.Vector3;
	size!: number;


	object3d!: THREE.Object3D;

	stringify(){
		return stringifyChunkPosition(this.position);
	}

	setMesh(object3d: THREE.Object3D){
		this.object3d = object3d;
	}
	
}