import { ChunkData } from "../../../server/models/chunk.js";
import { stringifyChunkPosition } from "../common/chunk.js";
import { Model } from "./model.js";


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