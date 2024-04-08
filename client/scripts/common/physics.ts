import { ExtendedMesh, ExtendedObject3D } from "enable3d";
import { SceneManager } from "./sceneman";




export class PhysicsManager {

	static addPhysics(mesh: ExtendedObject3D | ExtendedMesh, options: any = {  
		shape: 'concave'
	}){
		SceneManager.scene.physics.add.existing(mesh as any, options);
	}

	static destroy(mesh: ExtendedObject3D | ExtendedMesh){
		SceneManager.scene.physics.destroy(mesh.body);
	}

}