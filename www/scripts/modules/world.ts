import { ExtendedMesh, ExtendedObject3D, Scene3D, THREE }  from 'enable3d';
import Noise from 'noisejs';
import seedrandom from "seedrandom";
import { ImprovedNoise } from '../lib/ImprovedNoise';
import * as BufferGeometryUtils from "../lib/BufferGeometryUtils"
import { item } from './models/item';
import { CustomScene } from './models/scene';

export function getDistance(object, object2) {
	// Calculate the distance between object's position and playerPosition
	const dx = object.position.x - object2.position.x;
	const dy = object.position.y - object2.position.y;
	const dz = object.position.z - object2.position.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function generateWorldChunk(worldWidth, worldDepth, segmentSize, maxHeight, seed, position) {
    // Create a noise generator with the provided seed
    const rng = seedrandom(seed);
		var noise = new Noise.Noise(rng());

		const blockSize = segmentSize*2;

		function generateHeight( width, height ) {

			const data: number[] = [],
				size = width * height, z = rng() * 100;

			let quality = 2;

			for ( let j = 0; j < 4; j ++ ) {

				if ( j === 0 ) for ( let i = 0; i < size; i ++ ) data[ i ] = 0;

				for ( let i = 0; i < size; i ++ ) {

					const x = i % width, y = ( i / width ) | 0;
					data[ i ] += noise.perlin3( x / quality, y / quality, z ) * quality;


				}

				quality *= 4;

			}

			return data;

		}

		function getY( x, z ) {

			return Math.min(( data[ x + z * worldWidth ] * 0.15 ) | 0, maxHeight);

		}

		const worldHalfWidth = worldWidth / 2;
		const worldHalfDepth = worldDepth / 2;
		const data = generateHeight( worldWidth, worldDepth );

    // Create a group to hold all the blocks
    var worldGroup = new THREE.Group();

		let startX = Math.max(0, position.x - worldHalfWidth);
    let startZ = Math.max(0, position.z - worldHalfDepth);
    let endX = Math.min(worldWidth, position.x + worldHalfWidth);
    let endZ = Math.min(worldDepth, position.z + worldHalfDepth);


		const matrix = new THREE.Matrix4();

		const pxGeometry = new THREE.PlaneGeometry( blockSize, blockSize );
		pxGeometry.attributes.uv.array[ 1 ] = 0.5;
		pxGeometry.attributes.uv.array[ 3 ] = 0.5;
		pxGeometry.rotateY( Math.PI / 2 );
		pxGeometry.translate( blockSize/2, 0, 0 );

		const nxGeometry = new THREE.PlaneGeometry( blockSize, blockSize );
		nxGeometry.attributes.uv.array[ 1 ] = 0.5;
		nxGeometry.attributes.uv.array[ 3 ] = 0.5;
		nxGeometry.rotateY( - Math.PI / 2 );
		nxGeometry.translate( - blockSize/2, 0, 0 );

		const pyGeometry = new THREE.PlaneGeometry( blockSize, blockSize );
		pyGeometry.attributes.uv.array[ 5 ] = 0.5;
		pyGeometry.attributes.uv.array[ 7 ] = 0.5;
		pyGeometry.rotateX( - Math.PI / 2 );
		pyGeometry.translate( 0, blockSize/2, 0 );

		const pzGeometry = new THREE.PlaneGeometry( blockSize, blockSize );
		pzGeometry.attributes.uv.array[ 1 ] = 0.5;
		pzGeometry.attributes.uv.array[ 3 ] = 0.5;
		pzGeometry.translate( 0, 0, blockSize/ 2 );

		const nzGeometry = new THREE.PlaneGeometry( blockSize, blockSize );
		nzGeometry.attributes.uv.array[ 1 ] = 0.5;
		nzGeometry.attributes.uv.array[ 3 ] = 0.5;
		nzGeometry.rotateY( Math.PI );
		nzGeometry.translate( 0, 0, - blockSize/2 );

		//

		const geometries: any = [];

		for (let z = Math.min(startZ, endZ); z < Math.max(startZ, endZ); z++) {
			for (let x = Math.min(startX, endX); x < Math.max(startX, endX); x++) {

				const h = getY( x, z );

				matrix.makeTranslation(
					x * blockSize - worldHalfWidth * blockSize,
					h * blockSize/2,
					z * blockSize - worldHalfDepth * blockSize
				);

				const px = getY( x + 1, z );
				const nx = getY( x - 1, z );
				const pz = getY( x, z + 1 );
				const nz = getY( x, z - 1 );

				geometries.push( pyGeometry.clone().applyMatrix4( matrix ) );

				if ( ( px !== h && px !== h + 1 ) || x === 0 ) {

					geometries.push( pxGeometry.clone().applyMatrix4( matrix ) );

				}

				if ( ( nx !== h && nx !== h + 1 ) || x === worldWidth - 1 ) {

					geometries.push( nxGeometry.clone().applyMatrix4( matrix ) );

				}

				if ( ( pz !== h && pz !== h + 1 ) || z === worldDepth - 1 ) {

					geometries.push( pzGeometry.clone().applyMatrix4( matrix ) );

				}

				if ( ( nz !== h && nz !== h + 1 ) || z === 0 ) {

					geometries.push( nzGeometry.clone().applyMatrix4( matrix ) );

				}

			}

		}

		if(!geometries.length) return worldGroup;

		const geometry = BufferGeometryUtils.mergeGeometries( geometries );
		geometry!.computeBoundingSphere();

		const colors = [0x00ff00, 0xff0000, 0x0000ff];
		const rand = Math.min(Math.floor(Math.random() * 3 - 1), 1);

		const mesh = new THREE.Mesh( geometry!, new THREE.MeshLambertMaterial( { color: colors[rand], side: THREE.DoubleSide } ) );
		worldGroup.add( mesh );

		mesh.receiveShadow = true;

    return worldGroup;
}

function updateChunkPhysics(world, chunk, rm){
	try{
		if(rm) return world.physics.destroy(world.body);
	} catch(e){}
	try{
		world.physics.add.existing(chunk as any, {
			shape: 'concave',
			mass: 0,
			collisionFlags: 1,
			autoCenter: false
		});
	} catch(e) {}
}

// Function to get the chunk index based on player position
export function getChunkIndex(position, chunkSize) {
	return {
			x: Math.floor(position.x / chunkSize),
			z: Math.floor(position.z / chunkSize)
	};
}

function chunkExists(group, area){
	let returns = false;

	group.traverse(element => {
		if (
			element.position.x >= area.minX &&
			element.position.x <= area.maxX &&
			element.position.y >= area.minY &&
			element.position.y <= area.maxY &&
			element.position.z >= area.minZ &&
			element.position.z <= area.maxZ
		) {
			// Element exists within the area
			returns = element;
		}
	});

	return returns;
}

export function chunkOverlaps(chunk, loadedChunks, chunkSize) {
	for (const loadedChunk of loadedChunks) {
		const [chunkX, chunkZ] = loadedChunk.split('_').map(Number);
		const overlapX = Math.abs(chunk.position.x - chunkX) < chunkSize;
		const overlapZ = Math.abs(chunk.position.z - chunkZ) < chunkSize;
		if (overlapX && overlapZ) {
				return true; // Chunk overlaps with existing loaded chunk
		}
	}
	return false; // Chunk does not overlap
}

// Function to load chunks around the player
export function loadChunksAroundPlayer(playerPosition, worldGroup, chunkSize, maxHeight, seed, loadedChunks) {
	const currentPlayerChunk = getChunkIndex(playerPosition, chunkSize);
	const chunkRange = 1; // Number of chunks to load in each direction

	for (let xOffset = -chunkRange; xOffset <= chunkRange; xOffset++) {
			for (let zOffset = -chunkRange; zOffset <= chunkRange; zOffset++) {
					const x = currentPlayerChunk.x + xOffset;
					const z = currentPlayerChunk.z + zOffset;
					const chunkKey = `${x}_${z}`;

					if (!loadedChunks.has(chunkKey)) {

						const chunkPosition = {
								x: x * chunkSize,
								z: z * chunkSize
						};

						// const area = {
						// 	minX: chunkPosition.x-chunkSize,
						// 	maxX: chunkPosition.x,
						// 	minZ: chunkPosition.z-chunkSize,
						// 	maxZ: chunkPosition.z,
						// 	minY: -10,
						// 	maxY: 100
						// }

						// if(chunkExists(worldGroup, area)) return worldGroup.remove(chunkExists(worldGroup, area));
						
						const newChunk = generateWorldChunk(chunkSize, chunkSize, 2, maxHeight, seed, chunkPosition);

						// if (!chunkOverlaps(newChunk, loadedChunks, chunkSize)) {
							worldGroup.add(newChunk);
							loadedChunks.add(chunkKey);
							updateChunkPhysics(worldGroup, newChunk, false);
						// }						

						
					}
			}
	}
}

// Function to unload chunks that are too far from the player
export function unloadDistantChunks(playerPosition, worldGroup, chunkSize, loadedChunks) {
	const currentPlayerChunk = getChunkIndex(playerPosition, chunkSize);
	const chunkUnloadDistance = 2; // Number of chunks away from the player to unload

	// Iterate over loaded chunks and check distance from the player
	loadedChunks.forEach(chunkKey => {
			const [chunkX, chunkZ] = chunkKey.split('_').map(Number);
			if (Math.abs(chunkX - currentPlayerChunk.x) > chunkUnloadDistance ||
					Math.abs(chunkZ - currentPlayerChunk.z) > chunkUnloadDistance) {
					const chunkToRemove = worldGroup.getObjectByName(chunkKey);
					if (chunkToRemove) {
							updateChunkPhysics(worldGroup, chunkToRemove, true);
							worldGroup.remove(chunkToRemove);
							loadedChunks.delete(chunkKey);
					}
			}
	});
}

// Update function to be called each frame or tick
export function updateChunkss(playerPosition, worldGroup, chunkSize, maxHeight, loadedChunks, seed) {
	loadChunksAroundPlayer(playerPosition, worldGroup, chunkSize, maxHeight, seed, loadedChunks);
	unloadDistantChunks(playerPosition, worldGroup, chunkSize, loadedChunks);
}


export type chunktype = {
	item: item,
	name: string,
	textures?: number[],
	shader?: string
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
			collisionFlags: 1,
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

}

function stringifyChunkPosition(pos){
	return pos.x+', '+pos.y+', '+pos.z;
}

function getChunkType(noiseValue, loadedChunks: ChunkSet){
	const noiseColorIndex = Math.floor((noiseValue / 2 + 0.5) * (loadedChunks.chunkTypes.length - 1));
	return loadedChunks.chunkTypes[0];
}

function parseMaterialOptions(options){
	const o = {};
	const keys = ['emissive', 'emissiveIntensity', 'metalness', 'opacity', 'color', 'roughness', 'wireframe'];
	for(let i of keys) if(i in options) o[i] = options[i];
	return o;
}

function makeSegmentMaterial(texture: THREE.Texture, chunkType: chunktype, scene: CustomScene){
	
	const { fragment, vertex, materialOptions } = (scene.findLoadedResource(chunkType.shader ? chunkType.shader+'.shader' : 'm:segment.shader', 'm:segment.shader') || {}).resource as any;

	const uniforms = {
		textureMap: { value: texture },
		// shadowMap: { value: scene.lightSet.directionalLight.shadow.map }
	};

	const mat = materialOptions ? new THREE.MeshStandardMaterial({
		...parseMaterialOptions(materialOptions),
		map: texture
	}) : new THREE.ShaderMaterial({
		fragmentShader: fragment,
		vertexShader: vertex,
		uniforms
	});
	
	return mat;
}

// Function to load a chunk
function loadChunk(chunkPosition, { chunkSize, loadedChunks } : { chunkSize: number, loadedChunks: ChunkSet }) {
	
	const noiseValue = loadedChunks.noise.perlin3(chunkPosition.x * 0.1, 0, chunkPosition.z * 0.1);
	
	const geometry = new THREE.BoxGeometry(chunkSize, 2, chunkSize);

	const chunkType = getChunkType(noiseValue, loadedChunks);	

	const materials = 'textures' in chunkType ? chunkType.textures!.map(i => makeSegmentMaterial(chunkType.item.texture[i], chunkType, loadedChunks.scene)) : makeSegmentMaterial(chunkType.item.texture, chunkType, loadedChunks.scene);

	const chunk = new ExtendedMesh(geometry, materials);

	chunk.receiveShadow = true;
	chunk.castShadow = true;

	chunk.position.copy(chunkPosition).multiplyScalar(chunkSize);

	loadedChunks.add(stringifyChunkPosition(chunkPosition), chunk);
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

// Function to update loaded chunks based on player position
export function updateChunks(player, worldGroup, chunkSize, maxHeight, loadedChunks, renderDistance, seed) {
	const playerChunkPosition = player.position.clone().divideScalar(chunkSize).floor();

	// Unload chunks that are too far from the player
	for (const {key, chunk} of loadedChunks.entries()) {
			const chunkPosition = new THREE.Vector3(...key.split(',').map(Number));
			// chunkPosition.y = playerChunkPosition.y;
			const distance = chunkPosition.clone().sub(playerChunkPosition).length();
			if (distance > renderDistance+2) {
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
