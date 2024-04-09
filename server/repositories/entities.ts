import { Socket } from "socket.io";
import { ServerData } from "../models/data";
import { EntityData } from "../models/entity";
import { xyz } from "../models/misc.xyz";
import { ResourceMap } from "./resources";
import { ping, pingFrom } from "../ping/ping";
import { Sockets } from "../ping/sockets";
import { ItemData } from "../models/item";
import { Items } from "./items";


export class Entities {

	static entities : EntityData[] = [];
	
	static spawn(type: string, position: xyz, name?: string, variant?: string, inventory?: any[], data?: any){
		
		const ref = ResourceMap.findResource(type);
		
		if(!ref) return;

		const entity = ServerData.create<EntityData>(EntityData, {
			position,
			name,
			variant,
			type,
			inventory: inventory ? inventory.map(item => Items.create(item.id, item.quantity, item.data)) : null,
			data: {...data}
		});

		entity.setReference(ref.data);

		Entities.entities.push(entity);

		Sockets.emit('entity:spawn', { entity });

		return entity;
	}

	static find(id: string){
		return this.entities.find(e => e.id == id);
	}

	static despawn(entity: string | EntityData){
		if(typeof entity == 'string') entity = Entities.find(entity)!;
		Sockets.emit('entity:despawn', { entity });
		Entities.entities.splice(Entities.entities.indexOf(entity), 1);
	}

	static target(id: string, position: xyz | null){
		this.entities.forEach(entity => {
			if(entity.id == id){
				entity.targetPosition = position;
			}
		});
	}

	static displace(id: string, position: xyz){
		this.entities.forEach(entity => {
			if(entity.id == id){
				entity.position = position;
			}
		});
	}

	static startPing(socket: Socket, serverdata){
		pingFrom(socket, 'entity:move', ({entity,position}) => {
			Entities.displace(entity, position);
		});

		pingFrom(socket, 'entity:settarget', ({entity,position}) => {
			Entities.target(entity, position);
			socket.broadcast.emit('entity:settarget', {entity, position});
		});

		pingFrom(socket, 'entity:inventory', (
			{
				entity:eid,
				type,
				item,
				action,
				full,
				inventory
			} : 
			{ entity: string, type: 'add' | 'remove', item: {
				type: string,
				id: string,
				quantity: number,
				data: any
			}, action: string, 
			full?: boolean,
			inventory?: {
				type: string,
				id: string,
				quantity: number,
				data: any
			}[] }
		) => {
			const entity = Entities.find(eid);
			if(entity){
				if(full){
					entity.inventory = inventory!.map(item => Items.create(item.type, item.quantity)!
					.setData({ id: item.id, data: item.data }));
				} else if(type == 'add'){
					entity.addToInventory(
						Items.create(item.type, item.quantity)!
						.setData({ id: item.id, data: item.data }),
					)
				} else if(type == 'remove'){
					entity.removeFromInventory(
						Items.create(item.type)!
						.setData({ id: item.id, data: item.data }),
						item.quantity
					)
				}
				socket.broadcast.emit('entity:inventory', {
					entity:eid,
					type,
					item: Items.create(item.type, item.quantity)!
					.setData({ id: item.id, data: item.data }),
					action,
					full,
					inventory: full ? entity.inventory : []
				});
			}
		});
	}

}