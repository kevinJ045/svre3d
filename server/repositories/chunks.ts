import { xyzTv } from "../../client/scripts/common/xyz.ts";
import { stringifyChunkPosition } from "../common/chunk.js";
import { Random } from "../common/rand.js";
import { worldData } from "../constant/world.js";
import { Data } from "../db/db.js";
import { ChunkData } from "../models/chunk.js";
import { xyz } from "../models/misc.xyz.js";
import { pingFrom } from "../ping/ping.js";
import { Sockets } from "../ping/sockets.js";
import { generateChunkHeight } from "../world/chunks.js";
import { EventEmitter } from "./events.ts";
import { Biomes } from "./biomes.js";
import { Entities } from "./entities.js";
import { Items } from "./items.js";
import { EntitySpawner } from "./spawner.js";
import { Structures } from "./structures.js";
import { Vector3 } from "three";


export class Chunks {

	static chunks: ChunkData[] = [];

	static maxHeight = 5;
	static chunkSize = worldData.chunkSize;

	static async loadChunk(position: xyz){
		if(this.has(stringifyChunkPosition(position))) return this.find(stringifyChunkPosition(position));
		position.y = generateChunkHeight(position.x, position.z, this.maxHeight, this.chunkSize);

		const chunk = ChunkData.create<ChunkData>(ChunkData, { position, chunkSize: this.chunkSize, biome: Biomes.getBiome(position.x, position.z).reference });

		await Structures.constructStructure(chunk);
		// EntitySpawner.spawnAtChunk(chunk);

		EventEmitter.chunkListeners(chunk);

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
	
	static findClose(pos: xyz){
		const p = xyzTv(pos);
		return [...this.chunks].sort((a, b) => xyzTv(a.position).distanceTo(p) - xyzTv(b.position).distanceTo(p))[0];
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
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}


	static startPing(socket, serverData){
		pingFrom(socket, 'chunk:request', async ({position, type}) => {

			const chunk = type == 'load' ? await Chunks.loadChunk(position) : Chunks.unloadChunk(position);
			
			socket.broadcast.emit('chunk:'+type, chunk || position);
			socket.emit('chunk:'+type, chunk || position);
			return chunk;
		});

		pingFrom(socket, 'structure:loot', async ({chunk: chunkPosition, entity: eid, id}) => {
			const chunk = Chunks.find(stringifyChunkPosition(chunkPosition));
			if(!chunk) return;
			const structure = chunk.structures.find(i => i.id == id);
			if(!structure) return;
			const entity = Entities.find(eid);
			if(!entity) return;
			const distance = 
				new Vector3(
					entity.position.x,
					entity.position.y,
					entity.position.z
				).distanceTo(
					new Vector3(
						chunk.position.x,
						chunk.position.y,
						chunk.position.z
					)
				);
			if(distance <= chunk.chunkSize){
				const looted = await Data.collection('loots')
				.findOne({
					name: structure.rule.name,
					position: chunk.position
				});
				if(!looted){
					if( structure.rule.drops){
						let drops = (
							structure.rule.randomDrops ?
							Structures.selectDropsByChance(structure.rule.drops, structure.rule.dropsCount || structure.rule.drops.length)
							: structure.rule.drops
						).map(i => Items.create(i.id, Array.isArray(i.quantity) ? (
							i.quantity.length == 2 && i.quantity[0] < i.quantity[1] ? 
							Random.from(i.quantity[0], i.quantity[1])
							: Random.pick(...i.quantity[0])
							) : i.quantity, i.data)!);
						drops.forEach(drop => {
							Sockets.emit('entity:inventory', {
								entity: eid,
								type: 'add',
								item: drop,
								action: 'add'
							});
							entity.addToInventory(drop)
						});
					}
					await Data.collection('loots')
					.insertOne({
						name: structure.rule.name,
						position: chunk.position,
						player: entity.data.username
					});
					structure.looted = true;
				}
				Sockets.emit('structure:loot', {
					chunk: stringifyChunkPosition(chunk.position),
					structure: structure.id
				});
			}
		});
	}


	static findSafeSpawnPoint(biomeName, minDistanceFromBorders = 5) {

		let spawnPoint: any = null;

		const maxAttempts = 1000000;
		let attempts = 0;

		while (attempts < maxAttempts) {
			attempts++;

			const randomX = Math.floor(Math.random() * worldData.nearWidth);
			const randomZ = Math.floor(Math.random() * worldData.neaDepth);

			const position = { x: randomX, y: 0, z: randomZ };

			const biome = Biomes.getBiome(randomX, randomZ);


			if (biome.reference.manifest.id === biomeName) {
				console.log('Found', biome.reference.manifest.id);

				let isSafeSpawnPoint = minDistanceFromBorders;
				
				for (let dx = -(minDistanceFromBorders * this.chunkSize); dx <= (minDistanceFromBorders * this.chunkSize); dx += this.chunkSize) {
					for (let dz = -(minDistanceFromBorders * this.chunkSize); dz <= (minDistanceFromBorders * this.chunkSize); dz += this.chunkSize) {
						
						const surroundingPosition = {
							x: position.x + dx,
							z: position.z + dz
						};
						
						const surroundingBiome = Biomes.getBiome(surroundingPosition.x, surroundingPosition.z);

						if (surroundingBiome.reference.manifest.id === biomeName) {
							isSafeSpawnPoint--;
							break; 
						}

						// console.log(surroundingBiome.reference.manifest.id);
					}

					console.log(isSafeSpawnPoint);

					if (isSafeSpawnPoint < minDistanceFromBorders/2) {
						break;
					}
				}

				spawnPoint = position;
				
			}
		}

		return spawnPoint || (
			minDistanceFromBorders > 3 ?
			Chunks.findSafeSpawnPoint(biomeName, minDistanceFromBorders - 1) 
			: null
		);
	}

}