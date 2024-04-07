import { THREE } from "enable3d";
import { Utils } from "../modules/utils";
 
export function makeChunk(size: number, material?: THREE.Material){
	const geometry = new THREE.BoxGeometry(size, Math.floor(size / 2), size);
	const mesh = new THREE.Mesh(geometry, material || new THREE.MeshStandardMaterial({ color: Utils.pickRandom(0x808080, 0xf0f0f0, 0x404040), roughness: 1 }));
	return mesh;
}