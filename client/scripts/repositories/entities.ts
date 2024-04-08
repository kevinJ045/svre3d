import { ExtendedObject3D, THREE } from "enable3d";
import { SceneManager } from "../common/sceneman";
import { Entity } from "../models/entity";
import { ResourceMap } from "./resources";
import { EntityData } from "../../../server/models/entity";
import { ServerData } from "../../../server/models/data";
import { PhysicsManager } from "../common/physics";
import { ping, pingFrom } from "../socket/socket";
import { cloneGltf } from "../lib/gltfclone";
import { Items } from "./items";
import { PlayerInfo } from "./player";


export class Entities {

	static entities: Entity[] = [];


	static spawn(entityData: EntityData){

		if(this.entities.find(e => e.data.username == PlayerInfo.username)){
			if(entityData.data.username == PlayerInfo.username) return;
		}

		const entity = ServerData.create<Entity>(Entity, entityData);
		entity.id = entityData.id;

		const ref = ResourceMap.find(entityData.reference!.id)!;

		entity.setReference(ref);
		entity.speed = ref.config?.speed || 1;

		entity.inventory = entity.inventory.map(i => Items.create(i));

		const entityMesh = new ExtendedObject3D();

		SceneManager.scene.animationMixers.add(entityMesh.anims.mixer);
    entityMesh.anims.mixer.timeScale = 1;

		console.log(ref);

		const refMesh: THREE.Object3D = cloneGltf(ref.load);
		SceneManager.scene.scene.add(refMesh);

		console.log(refMesh);

		refMesh.traverse(child => {
      child.castShadow = true
      child.receiveShadow = false
    });

		entityMesh.add(refMesh);

		entityMesh.position.set(entity.position.x, entity.position.y + 5, entity.position.z);

		entity.object3d = entityMesh;

		entity.playAnimation(entity.state);

		SceneManager.scene.scene.add(entityMesh);
		entity.addPhysics();

		this.entities.push(entity);

		return entity;
	} 

	static find(id: string | { id: string }){
		return Entities.entities.find(e => e.id == (typeof id == 'string' ? id : id.id));
	}

	static despawn(entity: string | Entity){
		if(typeof entity == 'string') entity = Entities.find(entity)!;
		entity.destroy();
		Entities.entities.splice(Entities.entities.indexOf(entity), 1);
	}


	static moveEntity(id: Entity | string, position: any){
		const entity = typeof id == "string" ? this.find(id) : id;
		if(entity){
			ping('entity:move', entity);
		}		
	}

	static ping(){
		pingFrom('entity:settarget', ({entity:se, position}) => {
			const entity = Entities.find(se);
			if(entity){
				entity.displace(new THREE.Vector3(position.x, position.y, position.z));
			} else {}
		});

		pingFrom('entity:spawn', ({entity}) => {
			Entities.spawn(entity);
		});
	}

	static update(){
		Entities.entities.forEach(entity => {
			entity.update();
		});
	}

}