import { stringifyChunkPosition } from "../common/chunk";
import { worldData } from "../constant/world";
import { ChunkData } from "../models/chunk";
import { xyz } from "../models/misc.xyz";
import { pingFrom } from "../ping/ping";
import { generateChunkHeight } from "../world/chunks";
import { Biomes } from "./biomes";
import { EntitySpawner } from "./spawner";
import { Structures } from "./structures";


export class Chunks {

	static chunks: ChunkData[] = [];

	static maxHeight = 5;
	static chunkSize = worldData.chunkSize;

	static loadChunk(position: xyz){
		if(this.has(stringifyChunkPosition(position))) return this.find(stringifyChunkPosition(position));
		position.y = generateChunkHeight(position.x, position.z, this.maxHeight, this.chunkSize);

		const chunk = ChunkData.create<ChunkData>(ChunkData, { position, chunkSize: this.chunkSize, biome: Biomes.getBiome(position.x, position.z).reference });

		Structures.constructStructure(chunk);
		// EntitySpawner.spawnAtChunk(chunk);

		this.chunks.push(chunk);

		return chunk;
	}

	static unloadChunk(position: xyz){
		this.delete(stringifyChunkPosition(position));
	}

	static clear(){
		this.chunks = [];
		return this;
	}

	static find(key: string){
		return this.chunks.find(i => i.stringify() == key);
	}
	select
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
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}


	static startPing(socket, serverData){
		pingFrom(socket, 'chunk:request', ({position, type}) => {

			const chunk = type == 'load' ? Chunks.loadChunk(position) : Chunks.unloadChunk(position);
			
			socket.broadcast.emit('chunk:'+type, chunk || position);
			socket.emit('chunk:'+type, chunk || position);
			return chunk;
		});
	}


	static findSafeSpawnPoint(biomeName) {
		
		const minDistanceFromBorders = 5; // blocks

		let spawnPoint: any = null;

		const maxAttempts = 1000000;
		let attempts = 0;

		while (attempts < maxAttempts) {
			attempts++;

			const randomX = Math.floor(Math.random() * worldData.nearWidth);
			const randomZ = Math.floor(Math.random() * worldData.neaDepth);

			const position = { x: randomX, y: 0, z: randomZ };

			const biome = Biomes.getBiome(randomX, randomZ);

			if (biome.reference.name === biomeName) {

				let isSafeSpawnPoint = true;
				
				for (let dx = -minDistanceFromBorders; dx <= minDistanceFromBorders; dx += this.chunkSize) {
					for (let dz = -minDistanceFromBorders; dz <= minDistanceFromBorders; dz += this.chunkSize) {
						
						const surroundingPosition = {
								x: position.x + dx,
								z: position.z + dz
						};
						
						const surroundingBiome = Biomes.getBiome(surroundingPosition.x, surroundingPosition.z);

						if (surroundingBiome.reference.name !== biomeName) {
							isSafeSpawnPoint = false;
							break; 
						}
					}

					if (!isSafeSpawnPoint) {
						break;
					}
				}

				if (isSafeSpawnPoint) {
					return position;
				}
				
			}
		}

		return spawnPoint;
	}

}