import { stringifyChunkPosition } from "../common/chunk";
import { SceneManager } from "../common/sceneman";
import { Chunk } from "../models/chunk";
import { makeChunk } from "../objects/chunk";
import { THREE } from "enable3d";
import { ping, pingFrom } from "../socket/socket";
import { PhysicsManager } from "../common/physics";

export class Chunks {

	static chunks: Chunk[] = [];

	static chunkFromData(chunk: Record<string, any>){
		return Chunk.from(chunk) as Chunk;
	}

	static loadChunk(chunk: Chunk){
		const chunkObject = makeChunk(chunk.size);
		chunk.setMesh(chunkObject);
		chunkObject.position.set(chunk.position.x, chunk.position.y, chunk.position.z);
		SceneManager.scene.scene.add(chunkObject);
		PhysicsManager.addPhysics(chunkObject, {
			shape: 'box',

			width: chunk.size,
			height: Math.floor(chunk.size/2),
			depth: chunk.size,

			mass: 0,
		});
		this.chunks.push(chunk);
	}

	static chunkObjects(){
		return this.chunks.map(chunk => chunk.object3d);
	}

	static unloadChunk(chunk: Chunk){
		const key = chunk.stringify();
		const found = Chunks.find(key);
		if (found) {
			Chunks.delete(key);
		}
	}

	static clear(){
		this.chunks = [];
		return this;
	}

	static find(key: string){
		return this.chunks.find(i => i.stringify() == key);
	}

	static at(index: number){
		return this.chunks.at(index);
	}

	static index(found: any){
		return this.chunks.indexOf(found);
	}

	static entries(){
		return [...this.chunks];
	}

	static has(key: string){
		return this.find(key) ? true : false;
	}

	static delete(key: string){
		const found = this.find(key);
		if(found){
			SceneManager.scene.scene.remove(found.object3d);
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}

	static requestLoadChunk(position: THREE.Vector3){

		ping('chunk:request', {position, type: 'load'});

	}
	
	static requestUnloadChunk(position: THREE.Vector3){

		ping('chunk:request', {position, type: 'unload'});
	}

	static init(){

		pingFrom('chunk:load', (data) => {
			if(!Chunks.has(stringifyChunkPosition(data.position)))
			 Chunks.loadChunk(Chunks.chunkFromData({...data, size: data.chunkSize, position: new THREE.Vector3(data.position.x,data.position.y, data.position.z)}));
		});

		pingFrom('chunk:unload', (data) => {
			Chunks.delete(stringifyChunkPosition(data));
		});

	}

	static update(playerPosition, renderDistance, chunkSize = 5){
		const playerChunkPosition = playerPosition.clone().divideScalar(chunkSize).floor();

    // Calculate the range of chunk coordinates around the player within the render distance
    const startX = Math.floor(playerChunkPosition.x - renderDistance);
    const endX = Math.ceil(playerChunkPosition.x + renderDistance);
    const startZ = Math.floor(playerChunkPosition.z - renderDistance);
    const endZ = Math.ceil(playerChunkPosition.z + renderDistance);
		
		const unloadStartX = Math.floor(playerChunkPosition.x - 2 * renderDistance);
    const unloadEndX = Math.ceil(playerChunkPosition.x + 2 * renderDistance);
    const unloadStartZ = Math.floor(playerChunkPosition.z - 2 * renderDistance);
    const unloadEndZ = Math.ceil(playerChunkPosition.z + 2 * renderDistance);

    // Unload chunks that are outside the range
    for (let i = Chunks.chunks.length - 1; i >= 0; i--) {
			const chunk = Chunks.chunks[i];
			const chunkPosition = chunk.position.clone().divideScalar(chunkSize).floor();

			// Check if the chunk is outside the range of loaded chunks
			if (chunkPosition.x < unloadStartX || chunkPosition.x > unloadEndX || chunkPosition.z < unloadStartZ || chunkPosition.z > unloadEndZ) {
				Chunks.requestUnloadChunk(chunk.position);
			}
    }

    // Load chunks within the range around the player
    for (let x = startX; x <= endX; x++) {
			for (let z = startZ; z <= endZ; z++) {
				if(!Chunks.has(stringifyChunkPosition({ x, z })))
					Chunks.requestLoadChunk(new THREE.Vector3(x * chunkSize, 0, z * chunkSize));
			}
    }
	}

}