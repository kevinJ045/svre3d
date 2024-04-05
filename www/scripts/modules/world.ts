import { ExtendedMesh, ExtendedObject3D, Scene3D, THREE }  from 'enable3d';
import Noise from 'noisejs';
import seedrandom from "seedrandom";
import { ImprovedNoise } from '../lib/ImprovedNoise';
import * as BufferGeometryUtils from "../lib/BufferGeometryUtils"
import { item } from './models/item';
import { CustomScene } from './models/scene';
import { Utils } from './utils';
import { generateWithRule } from './structure';
import { makeObjectMaterial, makeSegmentMaterial } from './shaderMaterial';

export type chunktype = {
	item: item,
	name: string,
	textures?: number[],
	shader?: string,
	structure_rules?: any
};

export class ChunkSet {
	scene: CustomScene;
	noise: Noise;
	rng: () => number;

	chunks: any[] = [];

	chunkTypes: chunktype[] = [];

	segment_object!: THREE.Object3D;

	constructor(scene: CustomScene, seed: string){
		this.scene = scene;
		this.rng = seedrandom(seed);
		this.noise = new Noise.Noise(this.rng());
	}

	add(key: string, chunk: any){
		this.chunks.push({ key, chunk });
		this.addChunk(chunk);
		return this;
	}

	addChunk(chunk: any){
		chunk.name = 'chunk';
		chunk.position.y -= 10;
		this.scene.scene.add(chunk);
		this.scene.physics.add.existing(chunk, {
			shape: 'box',
			mass: 0,
			// collisionFlags: 1,
			autoCenter: false,
			
			width: this.scene.chunkSize,
			depth: this.scene.chunkSize,
			height: 2
		});
	}

	removeChunk(chunk: any){
		this.scene.physics.destroy(chunk.body)
		this.scene.scene.remove(chunk);
	}

	clear(){
		this.chunks = [];
		return this;
	}

	find(key: string){
		return this.chunks.find(i => i.key == key);
	}

	at(index: number){
		return this.chunks.at(index);
	}

	index(found: any){
		return this.chunks.indexOf(found);
	}

	entries(){
		return [...this.chunks];
	}

	has(key: string){
		return this.find(key) ? true : false;
	}

	delete(key: string){
		const found = this.find(key);
		if(found){
			this.removeChunk(found.chunk);
			this.chunks.splice(this.index(found), 1);
		}
		return this;
	}
	
	chunkObjects(){
		return this.chunks.map(i => i.chunk);
	}

}

function stringifyChunkPosition(pos){
	return pos.x+', '+pos.y+', '+pos.z;
}

function getChunkType(noiseValue, chunkSize, loadedChunks: ChunkSet){
	// const num = 1/loadedChunks.chunkTypes.length * 0.1;
	const types = loadedChunks.chunkTypes;

	// const value = Math.abs(noiseValue);

	const index = Math.min(Math.abs(Math.floor(noiseValue * types.length-1)), types.length-1);

	return types[index];
}



let f = false;
// Function to load a chunk
function loadChunk(chunkPosition, { chunkSize, loadedChunks } : { chunkSize: number, loadedChunks: ChunkSet }) {

	const scale = 0.0001;
	const offset = 0;
	const noiseValue = loadedChunks.noise.perlin2((chunkPosition.x + offset) * scale, (chunkPosition.z + offset) * scale);

	const geometry = new THREE.BoxGeometry(chunkSize, 2, chunkSize);

	const chunkType = getChunkType(noiseValue, chunkSize, loadedChunks);	

	const materials = 'textures' in chunkType ? chunkType.textures!.map(i => makeSegmentMaterial(chunkType.item.texture[i], chunkType, loadedChunks.scene)) : makeSegmentMaterial(chunkType.item.texture, chunkType, loadedChunks.scene);

	const chunk = new ExtendedMesh(geometry, materials);

	chunk.receiveShadow = true;
	chunk.castShadow = true;

	chunk.position.copy(chunkPosition).multiplyScalar(chunkSize);

	loadedChunks.add(stringifyChunkPosition(chunkPosition), chunk);

	if(chunkType.structure_rules){

		const rule = Utils.pickRandom(...chunkType.structure_rules, loadedChunks.rng);

		const density = rule.density;


		const noiseAtPosition = Utils.randFrom(0, density, () => loadedChunks.noise.perlin3(chunkPosition.x * 0.1, 0, chunkPosition.z * 0.1));

		const randomThreshold = Math.floor(loadedChunks.rng() * density) * (noiseAtPosition < 0 ? -1 : 1);

		if (noiseAtPosition === randomThreshold){
			const object = loadedChunks.scene.findLoadedResource(rule.object, 'objects');

			const item = generateWithRule(object, object!.config!, loadedChunks.rng);

			chunk.add(item);

			const materialsRule = object!.config!.materials;

			item.children.forEach(item => {
				if(item.userData.rule){
					if(item.userData.rule.physics === true){
						loadedChunks.scene.physics.add.existing(item as any, {
							shape: 'convex',
							mass: 0
						})
					}
				}
			});

			if(materialsRule){
				item.children.forEach((child: any, index: number) => {
					const mat = materialsRule.length > 1 ? materialsRule[index] : materialsRule[0];
					if(mat){
						if(Array.isArray(child.material)){
							if(Array.isArray(mat)) child.material = materialsRule.map(mat => {
								return makeObjectMaterial(loadedChunks.scene.findLoadedResource(mat, 'shaders')!, loadedChunks.scene);
							});
							else {
								child.material = child.material.map(mate => {
									if(mate.name in mat){
										return makeObjectMaterial(loadedChunks.scene.findLoadedResource(mat[mate.name], 'shaders')!, loadedChunks.scene);
									} else {
										return mate;
									}
								});
							}
						} else{
							child.material = makeObjectMaterial(loadedChunks.scene.findLoadedResource(mat, 'shaders')!, loadedChunks.scene)
						}
					}
				});
			}
		}

	}

}

// Function to unload a chunk
function unloadChunk(chunkPosition, { loadedChunks }) {
	const key = stringifyChunkPosition(chunkPosition);
	const chunk = loadedChunks.find(key);
	if (chunk) {
			// scene.remove(chunk);
			loadedChunks.delete(key);
	}
}

function generateChunkHeight(x, z, maxHeight, chunkSize, loadedChunks) {
	// Scale the coordinates to control the frequency of the noise
	const frequency = 0.1; // Adjust as needed
	const scaledX = x * frequency;
	const scaledZ = z * frequency;

	// Generate Perlin noise value for the given coordinates
	const noiseValue = loadedChunks.noise.perlin3(scaledX, 0, scaledZ);

	// Map the noise value to the desired height range
	return Math.round(noiseValue * maxHeight) / 2.5;
}

function createCurvedGrassGeometry(width, curveHeight, curveWidth) {
	const curveSegments = 30;
	const grassGeometry = new THREE.BufferGeometry();

	// Create a curved shape for the grass
	const curve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(curveWidth / 2, curveHeight, 0),
			new THREE.Vector3(curveWidth, 0, 0)
	]);

	// Create the grass blade geometry along the curve
	const divisions = Math.floor(curveSegments * curve.getLength());
	const points = curve.getPoints(divisions);

	const vertices: number[] = [];
	const normals: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];

	for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const tangent = curve.getTangentAt(i / divisions).normalize();
			const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1)).normalize();

			// Add vertices for the grass blade
			const angle = Math.PI / 2;
			const offset = new THREE.Vector3(width * Math.cos(angle), width * Math.sin(angle), 0);
			const vertex1 = new THREE.Vector3().copy(point).sub(offset);
			const vertex2 = new THREE.Vector3().copy(point).add(offset);

			vertices.push(vertex1.x, vertex1.y, vertex1.z);
			vertices.push(vertex2.x, vertex2.y, vertex2.z);

			// Add normals for the grass blade
			normals.push(normal.x, normal.y, normal.z);
			normals.push(normal.x, normal.y, normal.z);

			// Add uvs for the grass blade
			uvs.push(0, 0);
			uvs.push(1, 0);

			// Add indices for the faces
			const indexOffset = i * 2;
			indices.push(indexOffset, indexOffset + 1, (indexOffset + 2) % (points.length * 2));
	}

	grassGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	grassGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
	grassGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
	grassGeometry.setIndex(indices);

	return grassGeometry;
}


// Create a function to generate grass spikes
function generateGrassSpikes(groundMesh, density = 10, heightRange = [0.2, 0.5]) {
	const groundGeometry = groundMesh.geometry;
	groundGeometry.computeBoundingBox();

	const groundBoundingBox = groundGeometry.boundingBox;
	const min = groundBoundingBox.min;
	const max = groundBoundingBox.max;

	const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Adjust material as needed

	// Generate grass spikes
	for (let i = 0; i < density; i++) {
		const randomX = THREE.MathUtils.randFloat(min.x, max.x);
		const randomZ = THREE.MathUtils.randFloat(min.z, max.z);
		const randomHeight = THREE.MathUtils.randFloat(heightRange[0], heightRange[1]);

		const grassGeometry = createCurvedGrassGeometry(1, 1, 0.1); // Adjust dimensions as needed
		const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
		
		grassMesh.position.set(randomX, max.y + randomHeight / 2, randomZ); // Adjust height position

		groundMesh.add(grassMesh);
	}
}

// Function to update loaded chunks based on player position
export function updateChunks(player, worldGroup, chunkSize, maxHeight, loadedChunks, renderDistance, seed) {
	const playerChunkPosition = player.position.clone().divideScalar(chunkSize).floor();

	// Unload chunks that are too far from the player
	for (const {key, chunk} of loadedChunks.entries()) {
		const chunkPosition = new THREE.Vector3(...key.split(',').map(Number));
		// chunkPosition.y = playerChunkPosition.y;
		const distance = chunkPosition.clone().sub(playerChunkPosition).length();
		if (distance > renderDistance*2) {
			unloadChunk(chunkPosition, { loadedChunks });
		}
	}

	// Load chunks around the player
	for (let x = playerChunkPosition.x - renderDistance; x <= playerChunkPosition.x + renderDistance; x++) {
		for (let z = playerChunkPosition.z - renderDistance; z <= playerChunkPosition.z + renderDistance; z++) {
			const y = generateChunkHeight(x, z, maxHeight, chunkSize, loadedChunks);
			const chunkPosition = new THREE.Vector3(x, y, z);
			if (!loadedChunks.has(stringifyChunkPosition(chunkPosition))) {
				loadChunk(chunkPosition, { loadedChunks, chunkSize });
			}
		}
	}
}
