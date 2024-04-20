import { Entity } from "../models/entity";
import { Item } from "../models/item";
import { Items } from "./items";
import * as uuid from "uuid";

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

		const equipmentMesh = item.reference!.mesh.clone();

		const ref = item?.reference;

		bodyMesh.add(equipmentMesh);

		equipmentMesh.position.x += ref.config!.position.x;
		equipmentMesh.position.y += ref.config!.position.y;
		equipmentMesh.position.z += ref.config!.position.z;

		if(ref.config!.scale){
			equipmentMesh.scale.x = ref.config!.scale.x;
			equipmentMesh.scale.y = ref.config!.scale.y;
			equipmentMesh.scale.z = ref.config!.scale.z;
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