import { ExtendedMesh, THREE } from "enable3d";
import { Random } from "../../../server/common/rand.js";
 
export function makeChunk(size: number, material?: THREE.Material){
	const geometry = new THREE.BoxGeometry(size + 0.1, Math.floor(size / 2), size + 0.1);
	const mesh = new ExtendedMesh(geometry, material || new THREE.MeshStandardMaterial({ color: Random.pick(0x808080, 0xf0f0f0, 0x404040), roughness: 1 }));
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	mesh.name = 'chunk';
	return mesh;
}