import { Entity } from "../models/entity";



export class Equipments {

	static entity(entity: Entity){
		const bodyMesh = Equipments.entityBody('body', entity);
		
	}

	static entityBody(partname: string, entity: Entity){

		let ref = entity.reference;

		let part = ref.config?.['3d']?.[partname] || '';

		const referee = part ? part.split('.') : [];
		let object = entity.object3d;
		referee.forEach(r => {
			object = object.children[r] || object;
		});

		return object;
	}

}