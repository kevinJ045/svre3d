import { ExtendedMesh, ExtendedObject3D, THREE } from "enable3d";
import { SceneManager } from "../common/sceneman.js";
import { Entity } from "../models/entity.js";
import { ResourceMap } from "./resources.js";
import { EntityData } from "../../../server/models/entity.js";
import { ServerData } from "../../../server/models/data.js";
import { PhysicsManager } from "../common/physics.js";
import { ping, pingFrom } from "../socket/socket.js";
import { cloneGltf } from "../lib/gltfclone.js";
import { Items } from "./items.js";
import { PlayerInfo } from "./player.js";
import { Equipments } from "./equipments.js";
import { ItemData } from "../../../server/models/item.js";
import { MaterialManager } from "./materials.js";
import { SkinPlayer } from "../misc/playerskin.js";
import { Settings } from "../settings/settings.js";
import { Chunks } from "./chunks.js";


export class Entities {

	static entities: Entity[] = [];


	static spawn(entityData: EntityData){

		if(this.entities.find(e => e.data.username == PlayerInfo.username)){
			if(entityData.data.username == PlayerInfo.username) return;
		}

		const entity = ServerData.create<Entity>(Entity, entityData);
		entity.id = entityData.id;

		const ref = ResourceMap.find(
		entity.type == 'item' ? 
		entityData.data.item.itemID
		: entityData.reference!.manifest.id)!;

		entity.setReference(ref);
		entity.speed = ref.base?.speed || 1;

		entity.inventory = entity.inventory.filter(Boolean).map(i => Items.create(i));

		const entityMesh = new ExtendedObject3D();

		// entityMesh.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2, 3)))

		SceneManager.scene.animationMixers.add(entityMesh.anims.mixer);
		entityMesh.anims.mixer.timeScale = 1;

		const refMesh: THREE.Object3D = ref.resource.loader == "gltf" ? cloneGltf(ref.resource.load) : ref.resource.mesh.clone();
		// SceneManager.scene.scene.add(refMesh);
		
		refMesh.castShadow = true;
		refMesh.receiveShadow = true;
		refMesh.traverse(child => {
			child.castShadow = true		// SceneManager.scene.scene.add(refMesh);
			child.receiveShadow = false
		});

		if(ref.view.bodyScale){
			refMesh.scale.setScalar(ref.view.bodyScale);
		}

		entityMesh.castShadow = true;

		entityMesh.add(refMesh);

		entityMesh.position.set(entity.position.x, entity.position.y + 5, entity.position.z);

		entity.object3d = entityMesh;

		entity.playAnimation(entity.state);

		// entityMesh.position.set(5000, 20, 15000);

		SceneManager.scene.scene.add(entityMesh);
		entity.addPhysics();

		this.entities.push(entity);

		if(ref.entity.type == 'player'){
			Equipments.entity(entity);
			SkinPlayer.skinPlayer(entity);
		}
		if(ref.view?.material){
			const variant = 
				((ref.entity?.variants || [])
				.find(i => i.name == entity.variant)?.material || {});
			if(typeof ref.view!.material == 'string'){
				const part = Equipments.entityBody('body', entity, '0.0');
				part.material = MaterialManager.parse(ref.view!.material, {});
			} else {
				const material = {
					...ref.view!.material,
					...variant
				};
				for(let i in material){
					if(i == 'variant') continue;
					const part = Equipments.entityBody(i, entity);
					part.material = MaterialManager.parse(material[i], {});
				}
			}
		}

		if(entity.type == 'item'){
			entity.on('collision', ({ object }: { object: ExtendedMesh }) => {
				if(object.userData.player){
					ping('entity:collectitem', { entity: entity.id, player: object.userData.player.id })
					.then(e => {
						ping('entity:hp', { entity: entity.id, hp: { current: 0, max: 1 } });
					});
				}
			});
		}

		entity.object3d.userData.info = {
			type: 'entity',
			entity
		};

		return entity;
	} 

	static find(id: string | { id: string }){
		return Entities.entities.find(e => e.id == (typeof id == 'string' ? id : id.id));
	}

	static despawn(entity: string | Entity){
		if(typeof entity == 'string') entity = Entities.find(entity)!;
		if(!entity) return;
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

		pingFrom('entity:setpos', ({entity:se, position}) => {
			const entity = Entities.find(se);
			if(entity){
				entity.rmPhysics();
				entity.object3d.position.set(position.x, 5, position.z);
				entity.addPhysics();
				entity.emit('move');
			}
		});
		
		pingFrom('entity:attackTarget', ({entity:se, target}) => {
			const entity = Entities.find(se);
			if(entity){
				entity.attackTarget = target ? Entities.find(target)! : null; // t
			}
		});

		pingFrom('entity:spawn', ({entity}) => {
			const spawn = Entities.spawn(entity);
			if(spawn?.type == 'm:player' && spawn?.data.username == PlayerInfo.player.username){
				PlayerInfo.setPlayerEntity(
					spawn
				);
			}
		});

		pingFrom('entity:despawn', ({entity}) => {
			let e = typeof entity == "string" ? Entities.find(entity) : entity;
			Entities.despawn(typeof entity == "string" ? entity : entity.id);
		});

		pingFrom('player:respawn', ({ entity, position }) => {
			const e = this.find(entity)!;
			if(!e) return;
			if(e.data.username == PlayerInfo.player.username){
				// ping('player:respawn', {
				// 	username: e.data.username,
				// 	color: e.data.color,
				// 	variant: e.variant,
				// 	eqiupment: e.data.equipment || { brow: 'm:brow-1' }
				// });\
				PlayerInfo.entity.setInventory([]);
				PhysicsManager.destroy(PlayerInfo.entity.object3d);
				PlayerInfo.entity.object3d.position.set(position.x || 0, 10, position.z || 0);
				Chunks.update(PlayerInfo.entity.object3d.position, Settings.get('renderDistance'));
				PlayerInfo.entity.addPhysics();
			}
		});

		pingFrom('entity:move', ({entity:se, direction, position, attack}) => {
			const entity = Entities.find(se);
			if(entity){
				if(!entity.targetLocation) 
					entity.displace(new THREE.Vector3(position.x, position.y, position.z));

				if(attack){
					entity.targetLocationList.unshift(new THREE.Vector3(position.x, position.y, position.z));
				}
				// entity.run({
				// 	x: direction.x * entity.speed,
				// 	z: direction.z * entity.speed
				// })
			} else {}
		});

		pingFrom('entity:reach', ({entity:se, position}) => {
			const entity = Entities.find(se);
			if(entity){
				const pos = new THREE.Vector3(position.x, position.y, position.z);
				const distance = pos.distanceTo(entity.object3d.position);
				if(distance < 1.5) entity.displace(null);
				else entity.displace(new THREE.Vector3(position.x, position.y, position.z));
				
				entity.rotateTowardsTarget(new THREE.Vector3(position.x, position.y, position.z));
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
					console.log(entity);
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
			equipment,
			flags
		}) => {

			if(!inventory) return;

			const entity = Entities.find(eid);

			if(!entity) return;

			if(entity.id == PlayerInfo.entity.id) return;

			entity!.data.equipment = equipment;
			
			entity!.inventory
				.filter(i => !inventory.find(i2 => i2.id == i.id))
				.map(i => {
					// IDFK wtf is going on in here
					i.data = inventory.find(i2 => i2.id == i.id)!.data
				});
			
			Equipments.entity(entity!);

			if(flags) entity.flags = flags;
		})
	}

	static update(){
		Entities.entities.forEach(entity => {
			entity.update();
		});
	}

}