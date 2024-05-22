import { Entity } from "../models/entity.js";
import { Item } from "../models/item.js";
import { Items } from "./items.js";
import * as uuid from "uuid";
import { MaterialManager } from "./materials.js";
import { cloneGltf } from "../lib/gltfclone.js";
import { THREE } from "enable3d";
import { ping } from "../socket/socket.js";

export class Equipments {

	static brows = {};

	static entity(entity: Entity) {

		if (!entity.data.equipment.brow) entity.data.equipment.brow = 'i:normal-brow';

		for (let i in entity.data.equipment) {
			let item = i == 'brow' ? Items.create({
				itemID: entity.data.equipment[i]
			} as any) : entity.findItemByData('wid', entity.data.equipment[i]);

			const ref = item?.reference;

			if (ref?.equipment?.type == i) {
				Equipments.equip(entity, i, item as Item);
			}

			if (i == 'brow') {
				Equipments.brows[item?.data.wid] = item?.itemID;
			}

		}

	}

	static equip(entity: Entity, type: string, item: Item) {
		const wid = item.data.wid || uuid.v4();
		if (item.data.wid != wid) item.data.wid = wid;

		entity.data.equipment[type] = wid;

		const bodyMesh = Equipments.entityBody(entity.reference.view.object.bone ? 'bone' : 'body', entity);

		const equipmentMesh = item.reference!.resource.loader == 'gltf' ? cloneGltf(item.reference.resource!.load) : item.reference!.resource.mesh.clone();

		// console.log(item.reference!.load)

		const ref = item?.reference;

		// console.log(item.reference.view?.animation);

		if (item.reference.view?.animation) {
			Items.initItemAnimation(item, equipmentMesh);
		}

		bodyMesh.add(equipmentMesh);
		bodyMesh.userData.attachment = [
			...(bodyMesh.userData.attachment || []),
			equipmentMesh
		]

		if (ref.config?.material) {
			const mat = ref.config?.material;
			if (typeof mat == 'string') {
				const material = MaterialManager.parse(mat, { ...entity.data, ...item.data });

				equipmentMesh.traverse(i => {
					equipmentMesh.material = i.material = material;
				});
			} else if (typeof mat == 'object') {
				for (let i in mat) {
					const material = mat[i];
					const part = Equipments.entityBody(
						i,
						{ ...item, object3d: equipmentMesh } as any,
					);
					part.material = MaterialManager.parse(material, { ...entity.data, ...item.data })
				}
			}
		}

		equipmentMesh.position.x += ref.view.object.position.x;
		equipmentMesh.position.y += ref.view.object.position.y;
		equipmentMesh.position.z += ref.view.object.position.z;

		if (ref.view.object!.scale) {
			equipmentMesh.scale.x = ref.view.object!.scale.x;
			equipmentMesh.scale.y = ref.view.object!.scale.y;
			equipmentMesh.scale.z = ref.view.object!.scale.z;
		}

		if (ref.view.object!.rotateY) {
			equipmentMesh.rotation.y = THREE.MathUtils.degToRad(ref.view.object!.rotateY);
		}

		item.data.wmeshid = equipmentMesh.uuid;

		equipmentMesh.userData.defaultPosition = ref.view.object.position;

		this.updateFlags('add', item, entity);
		entity.emit('equip');
	}

	static updateFlags(type: 'add' | 'remove', item: Item, entity: Entity) {
		const ref = item?.reference;
		if (ref.item?.flags) {
			const flags: string[] = ref.item?.flags;
			const excludeFlags: string[] = [];
			for (let i in (entity.data.equipment || {})) {
				let e = (entity.data.equipment || {})[i];
				if (typeof e == 'string') continue;
				if (e.reference.item?.flags) {
					excludeFlags.push(...e.reference.item?.flags);
				}
			}
			if (type == 'remove') flags
				.filter(i => !excludeFlags.includes(i))
				.forEach(i => {
					entity.flags.splice(entity.flags.indexOf(i), 1);
				});
			else if (type == 'add') flags
				.filter(i => !excludeFlags.includes(i))
				.forEach(i => {
					entity.flags.push(i);
				});

			entity.emit('flags');
		}
	}

	static unequip(entity: Entity, type: string, item: Item) {
		delete entity.data.equipment[type];

		const bodyMesh = Equipments.entityBody('body', entity);

		const equipmentMesh = bodyMesh.children.find(i => i.uuid == item.data.wmeshid)!;

		bodyMesh.remove(equipmentMesh);
		const attachment = (bodyMesh.userData.attachment || []);
		bodyMesh.userData.attachment = attachment.indexOf(equipmentMesh) > -1 ? attachment.splice(attachment.indexOf(equipmentMesh), 1) : attachment;

		delete item.data.wmeshid;
		delete item.data.wid;

		entity.data.uneqiupped = item;
		this.updateFlags('remove', item, entity);
		entity.emit('unequip');
	}

	static entityBody(partname: string, entity: Entity, fallback: string = '') {

		let ref = entity.reference;

		let part = ref.view?.object?.[partname] || fallback;

		const referee = part ? part.split('.') : [];
		let object = entity.object3d;
		referee.forEach(r => {
			object = object.children[r] || object;
		});

		return object;
	}

}
