import { stringifyChunkPosition } from "../common/chunk.js";
import { SceneManager } from "../common/sceneman.js";
import { Chunk } from "../models/chunk.js";
import { makeChunk } from "../objects/chunk.js";
import { THREE } from "enable3d";
import { ping, pingFrom } from "../socket/socket.js";
import { PhysicsManager } from "../common/physics.js";
import { ServerData } from "../../../server/models/data.js";
import { Biomes } from "./biomes.js";
import { WorldData } from "../world/data.js";
import { Structures } from "./structures.js";
import { PlayerInfo } from "./player.js";
import { xyz } from "../../../server/models/misc.xyz.js";
import { MaterialManager } from "./materials.js";
import { Settings } from "../settings/settings.js";
import GlobalEmitter from "../misc/globalEmitter.js";

export class Chunks {

	static chunks: Chunk[] = [];

	static _isCalculatingRenderDistance = false;
	static renderCloseAndFar(playerPosition: THREE.Vector3, renderDistance: number, detailsLimit?: number, chunk?: Chunk){
		if(Chunks._isCalculatingRenderDistance && !chunk) return;
		if(!chunk) Chunks._isCalculatingRenderDistance = true;

		detailsLimit = Math.max(10, Math.min(detailsLimit || 75, 100));

		const chunkSize = WorldData.get('chunkSize');
		const renderDistanceScaled = renderDistance * chunkSize;
    const halfRenderDistance = renderDistanceScaled * (detailsLimit / 100);
    const farRenderDistance = renderDistanceScaled * ((detailsLimit / 100) + 0.5);


    const playerPositionFloored = playerPosition.clone().floor();

		const detailChunk = (chunk: Chunk) => {
			const chunkPosition = chunk.object3d.position.clone().floor();

			const distance = Math.floor(
				new THREE.Vector3(
					playerPositionFloored.x,
					0,
					playerPositionFloored.z
				).distanceTo(new THREE.Vector3(
					chunkPosition.x,
					0,
					chunkPosition.z
				))
			);

			const isClose = detailsLimit == 100 || distance < halfRenderDistance;
			const isMid = distance > halfRenderDistance && distance < farRenderDistance;
			const isFar = distance >= farRenderDistance;

			if(isClose) {
				Chunks.setHighDetail(chunk);
			} else if (isMid) {
				Chunks.setMediumDetail(chunk);
			} else if(isFar){
				Chunks.setMediumDetail(chunk);
				Chunks.setLowDetail(chunk);
			}
		}


    if(chunk) detailChunk(chunk);
		else for (const chunk of Chunks.chunks) {
			detailChunk(chunk);
    }
		if(!chunk) Chunks._isCalculatingRenderDistance = false;
	}


	static setHighDetail(chunk: Chunk) {
		chunk.object3d.traverse((object) => {
			object.visible = true;
			let o: any = object;
			if(o.userData.__real__material__){
				o.material = o.userData.__real__material__;
			}
		});
	}

	static setMediumDetail(chunk: Chunk) {
		chunk.object3d.traverse(object => {
			object.visible = true;
			let o: any = object;
			if(o.material){
				if(!o.userData.__real__material__) o.userData.__real__material__ = o.material;
				o.material = Array.isArray(o.userData.__real__material__) ? o.userData.__real__material__.map(m => MaterialManager.getBaseColorMaterial(m)) : MaterialManager.getBaseColorMaterial(o.material);
				if(o.userData.__real__material__.uniforms){
					o.material.uniforms = o.userData.__real__material__.uniforms;
				}
			}
		});
	}

	static setLowDetail(chunk: Chunk) {
		chunk.object3d.traverse(object => {
			if(object.userData.info?.type !== 'chunk') object.visible = false;
		});
	}

	static chunkFromData(chunk: Record<string, any>) {
		return ServerData.create(Chunk, chunk).setData({
			position: new THREE.Vector3(chunk.position.x, chunk.position.y, chunk.position.z),
			biome: chunk.biome
		});
	}

	static loadChunk(chunk: Chunk) {
		const chunkObject = makeChunk(chunk.chunkSize);
		chunkObject.userData.info = {
			type: 'chunk',
			chunk
		}
		chunk.setMesh(chunkObject);
		Biomes.applyChunkBiome(chunk);
		chunkObject.position.set(chunk.position.x, chunk.position.y - 3, chunk.position.z);
		Structures.loadStrcuture(chunk);

		const addPhysics = () => PhysicsManager.addPhysics(chunkObject, {
			shape: 'box',

			width: chunk.chunkSize,
			height: Math.floor(chunk.chunkSize / 2),
			depth: chunk.chunkSize,

			mass: 0,
		});

		if(this.chunks.length > 20) {
			SceneManager.addAnimated(chunkObject, addPhysics);
		} else {
			SceneManager.scene.scene.add(chunkObject);
			addPhysics();
		}
		this.chunks.push(chunk);
		GlobalEmitter.emit('chunk:loaded', chunk);
	}

	static chunkObjects() {
		return this.chunks.map(chunk => chunk.object3d);
	}

	static unloadChunk(chunk: Chunk) {
		const key = chunk.stringify();
		const found = Chunks.find(key);
		if (found) {
			Chunks.delete(key);
		}
	}

	static clear() {
		this.chunks = [];
		return this;
	}

	static find(key: string) {
		return this.chunks.find(i => i.stringify() == key);
	}

	static at(index: number) {
		return this.chunks.at(index);
	}

	static index(found: any) {
		return this.chunks.indexOf(found);
	}

	static entries() {
		return [...this.chunks];
	}

	static has(key: string) {
		return this.find(key) ? true : false;
	}

	static delete(key: string) {
		const found = this.find(key);
		if (found) {
			SceneManager.scene.scene.remove(found.object3d);
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}

	static requestLoadChunk(position: THREE.Vector3) {

		ping('chunk:request', { position, type: 'load' });

	}

	static requestUnloadChunk(position: THREE.Vector3) {

		ping('chunk:request', { position, type: 'unload' });
	}

	static init() {
		let f = 1;
		pingFrom('chunk:load', (data) => {
			if (!Chunks.has(stringifyChunkPosition(data.position))) {
				Chunks.loadChunk(Chunks.chunkFromData(data));
				if (!Biomes.firstUpdate) {
					Biomes.updateSky(data.position);
					Biomes.firstUpdate = true;
				}
			}
			Chunks.loadRequests.splice(
				Chunks.loadRequests.indexOf(stringifyChunkPosition({ ...data.position, y: 0 })),
				1
			);
		});

		pingFrom('chunk:unload', (data) => {
			Chunks.delete(stringifyChunkPosition(data));
			Chunks.unloadRequests.splice(
				Chunks.unloadRequests.indexOf(stringifyChunkPosition(data)),
				1
			);
		});

		pingFrom('structure:loot', (data) => {
			const chunk = Chunks.find(data.chunk);
			if (!chunk) return;
			const structure = chunk.structures.find(i => i.id == data.structure);
			if (!structure) return;
			console.log(chunk, structure);
			structure.looted = true;
			chunk.object3d.traverse(o => chunk.object3d.remove(o));
			Structures.loadStrcuture(chunk);
		});

	}

	static findChunkAtPosition(position: THREE.Vector3): Chunk | null {
		for (const chunk of this.chunks) {
			if (
				position.x >= chunk.object3d.position.x &&
				position.x < chunk.object3d.position.x + chunk.chunkSize &&
				position.z >= chunk.object3d.position.z &&
				position.z < chunk.object3d.position.z + chunk.chunkSize
			) {
				return chunk;
			}
		}
		return null;
	}

	static loop(clock: any) {
		var time = clock.getElapsedTime();

		this.chunks.forEach(chunk => {

			if (chunk.data.liquids) {
				chunk.data.liquids.forEach(liquid => {
					liquid.material.uniforms.time.value = time;
				});
			}

		});

	}

	static unloadRequests: string[] = [];
	static loadRequests: string[] = [];
	static update(playerPosition, renderDistance) {
		const chunkSize = WorldData.get('chunkSize');
		const playerChunkPosition = playerPosition.clone().divideScalar(chunkSize).floor();

		// Calculate the range of chunk coordinates around the player within the render distance
		const startX = Math.floor(playerChunkPosition.x - renderDistance);
		const endX = Math.ceil(playerChunkPosition.x + renderDistance);
		const startZ = Math.floor(playerChunkPosition.z - renderDistance);
		const endZ = Math.ceil(playerChunkPosition.z + renderDistance);

		const unloadStartX = Math.floor(playerChunkPosition.x - 1.1 * renderDistance);
		const unloadEndX = Math.ceil(playerChunkPosition.x + 1.1 * renderDistance);
		const unloadStartZ = Math.floor(playerChunkPosition.z - 1.1 * renderDistance);
		const unloadEndZ = Math.ceil(playerChunkPosition.z + 1.1 * renderDistance);

		// Unload chunks that are outside the range
		for (let i = Chunks.chunks.length - 1; i >= 0; i--) {
			const chunk = Chunks.chunks[i];
			const chunkPosition = chunk.position.clone().divideScalar(chunkSize).floor();

			// Check if the chunk is outside the range of loaded chunks


			if (!Chunks.unloadRequests.includes(
				stringifyChunkPosition(chunkPosition)
			)) {
				if (chunkPosition.x < unloadStartX || chunkPosition.x > unloadEndX || chunkPosition.z < unloadStartZ || chunkPosition.z > unloadEndZ) {
					Chunks.requestUnloadChunk(chunk.position);
					Chunks.unloadRequests.push(
						stringifyChunkPosition(chunk.position)
					);
				}

			}
		}
		
		for (let x = startX; x <= endX; x++) {
			for (let z = startZ; z <= endZ; z++) {
				// if(!Chunks.has(stringifyChunkPosition({ x, z })))
				const pos = new THREE.Vector3(x * chunkSize, 0, z * chunkSize);
				if (!Chunks.loadRequests.includes(
					stringifyChunkPosition(pos)
				)) {
					Chunks.requestLoadChunk(pos);
					Chunks.loadRequests.push(
						stringifyChunkPosition(pos)
					);
				}

			}
		}
	}

}
