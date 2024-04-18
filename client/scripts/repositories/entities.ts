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
import { Equipments } from "./equipments";
import { ItemData } from "../../../server/models/item";
import { MaterialManager } from "./materials";


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

		const refMesh: THREE.Object3D = ref.resource.type == "gltf" ? cloneGltf(ref.load) : ref.mesh.clone();
		SceneManager.scene.scene.add(refMesh);

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

		if(ref.type == 'player'){
			Equipments.entity(entity);
		}

		if(ref.config?.material){
			const variant = 
				((ref.config?.variants || []).find(
					i => i.name == entity.variant
				) || {}).material || {};
			const material = {
				...ref.config!.material,
				...variant
			};
			for(let i in material){
				const part = Equipments.entityBody(i, entity);
				part.material = MaterialManager.parse(material[i], {});
			}
		}


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
			console.log(entity);
			Entities.spawn(entity);
		});

		pingFrom('entity:move', ({entity:se, direction, position}) => {
			const entity = Entities.find(se);
			if(entity){
				if(!entity.targetLocation) entity.displace(new THREE.Vector3(position.x, position.y, position.z));
				// entity.run({
				// 	x: direction.x * entity.speed,
				// 	z: direction.z * entity.speed
				// })
			} else {}
		});

		pingFrom('entity:reach', ({entity:se, position}) => {
			const entity = Entities.find(se);
			if(entity){
				console.log('reach on server');
				const pos = new THREE.Vector3(position.x, position.y, position.z);
				const distance = pos.distanceTo(entity.object3d.position);
				if(distance < 1.5) entity.displace(null);
				else entity.displace(new THREE.Vector3(position.x, position.y, position.z));
			} else {}
		});

		pingFrom('entity:inventory', (
			{
				entity:eid,
				type,
				item,
				action,
				full,
				inventory
			} : 
			{ full?: true, inventory?: ItemData[], entity: string, type: 'add' | 'remove', item: ItemData, action: string }
		) => {
			const entity = Entities.find(eid);
			if(entity){
				if(full) {
					entity.inventory = inventory!.map(i => Items.create(i));
					entity.emit('inventory', {type: 'reset', inventory: entity.inventory});
					entity.emit('inventory:reset', entity.inventory);
				} else if(type == 'add'){
					entity.addToInventory(
						Items.create(item)!,
					)
				} else if(type == 'remove'){
					entity.removeFromInventory(
						Items.create(item)!,
						item.quantity
					)
				}
			}
		});


		pingFrom('entity:hp', ({entity: eid, hp}) => {
			if(!hp) return;

			const entity = Entities.find(eid);
			entity?.setHealth(hp, false);
		});

		pingFrom('player:equipment', ({
			entity: eid,
			inventory,
			equipment
		}) => {

			if(!inventory) return;

			const entity = Entities.find(eid);
			entity!.data.equipment = equipment;

			entity!.inventory
				.filter(i => !inventory.find(i2 => i2.id == i.id))
				.map(i => {
					// IDFK wtf is going on in here
					i.data = inventory.find(i2 => i2.id == i.id)!.data
				});
			
			Equipments.entity(entity!);
		})
	}

	static update(){
		Entities.entities.forEach(entity => {
			entity.update();
		});
	}

}