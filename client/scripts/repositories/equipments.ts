import { Entity } from "../models/entity";
import { Item } from "../models/item";
import { Items } from "./items";
import * as uuid from "uuid";
import { MaterialManager } from "./materials";
import { cloneGltf } from "../lib/gltfclone";
import { THREE } from "enable3d";

export class Equipments {

	static brows = {};

	static entity(entity: Entity){

		if(!entity.data.equipment.brow) entity.data.equipment.brow = 'm:brow-1';

		for(let i in entity.data.equipment){
			let item = i == 'brow' ? Items.create({
				itemID: entity.data.equipment[i]
			} as any) : entity.findItemByData('wid', entity.data.equipment[i]);

			const ref = item?.reference;

			if(ref?.equipment?.type == i){
				Equipments.equip(entity, i, item as Item);
			}

			if(i == 'brow'){
				Equipments.brows[item?.data.wid] = item?.itemID;
			}

		}

	}

	static equip(entity: Entity, type: string, item: Item){
		const wid = item.data.wid ||  uuid.v4();
		if(item.data.wid != wid) item.data.wid = wid;

		entity.data.equipment[type] = wid;

		const bodyMesh = Equipments.entityBody('body', entity);

		const equipmentMesh = item.reference!.resource.type == 'gltf' ? cloneGltf(item.reference!.load) : item.reference!.mesh.clone();

		// console.log(item.reference!.load)

		const ref = item?.reference;

		if(item.reference.config?.animation){
			Items.initItemAnimation(item, equipmentMesh);
		}

		bodyMesh.add(equipmentMesh);

		if(ref.config?.material){
			const mat = ref.config?.material;
			if(typeof mat == 'string'){
				const material = MaterialManager.parse(mat, {...entity.data, ...item.data});
				
				equipmentMesh.traverse(i => {
					equipmentMesh.material = i.material = material;
				});
			} else if(typeof mat == 'object'){
				for(let i in mat){
					const material = mat[i];
					const part = Equipments.entityBody(
						i,
						{ ...item, object3d: equipmentMesh } as any,
					);
					part.material = MaterialManager.parse(material, {...entity.data, ...item.data})
				}
			}
		}

		equipmentMesh.position.x += ref.config!.position.x;
		equipmentMesh.position.y += ref.config!.position.y;
		equipmentMesh.position.z += ref.config!.position.z;

		if(ref.config!.scale){
			equipmentMesh.scale.x = ref.config!.scale.x;
			equipmentMesh.scale.y = ref.config!.scale.y;
			equipmentMesh.scale.z = ref.config!.scale.z;
		}

		if(ref.config!.rotateY) {
			equipmentMesh.rotation.y = THREE.MathUtils.degToRad(ref.config!.rotateY);
		}

		item.data.wmeshid = equipmentMesh.uuid;

		entity.emit('equip');
	}

	static unequip(entity: Entity, type: string, item: Item){
		delete entity.data.equipment[type];

		const bodyMesh = Equipments.entityBody('body', entity);

		const equipmentMesh = bodyMesh.children.find(i => i.uuid == item.data.wmeshid)!;

		bodyMesh.remove(equipmentMesh);

		delete item.data.wmeshid;
		delete item.data.wid;

		entity.data.uneqiupped = item;
		entity.emit('unequip');
	}

	static entityBody(partname: string, entity: Entity, fallback: string = ''){

		let ref = entity.reference;

		let part = ref.config?.['3d']?.[partname] || fallback;

		const referee = part ? part.split('.') : [];
		let object = entity.object3d;
		referee.forEach(r => {
			object = object.children[r] || object;
		});

		return object;
	}

}