import { Socket } from "socket.io";
import { ServerData } from "../models/data";
import { EntityData } from "../models/entity";
import { xyz } from "../models/misc.xyz";
import { ResourceMap } from "./resources";
import { ping, pingFrom } from "../ping/ping";
import { Sockets } from "../ping/sockets";
import { ItemData } from "../models/item";
import { Items } from "./items";
import { Vector3 } from "three";
import { Chunks } from "./chunks";
import { Random } from "../common/rand";


export class Entities {

	static entities : EntityData[] = [];
	
	static spawn(type: string, position: xyz, name?: string, variant?: string, inventory?: any[], data?: any, exp?: any){
		
		const ref = ResourceMap.findResource(type);
		
		if(!ref) return;

		const entity = ServerData.create<EntityData>(EntityData, {
			position,
			name,
			variant,
			type,
			inventory: inventory ? inventory.map(item => Items.create(item.id, item.quantity, item.data)) : null,
			data: {...data},
			exp: exp ? exp : {
				level: 1,
				current: 1,
				max: 100
			}
		});

		entity.setReference(ref.data);

		const v = (ref.data.config?.variants || []).find(i => i.name == variant);

		let drops = (ref.data.config?.drops || []);

		if(ref.data.config?.health){
			entity.health = { max: ref.data.config.health, current: ref.data.config.health }
		}
		if(ref.data.config?.damage) entity.damage = ref.data.config?.damage;
		if(ref.data.config?.defense) entity.defense = ref.data.config?.defense;

		if(v){
			if(v.drops){
				drops.push(...v.drops);
			}
			if(v.health){
				entity.health = { max: v.health, current: v.health }
			}
			if(v.damage) entity.damage = v.damage;
			if(v.defense) entity.defense = v.defense;
		}

		if(drops.length){
			entity.inventory.push(...drops.map(item => Items.create(item.item, item.quantity, item.data)))
		}

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


	static moveTowardsTarget(entity) {
		if (entity.targetPosition) {
			const position = new Vector3(entity.position.x, 0, entity.position.z);
			const targetPosition = new Vector3(entity.targetPosition.x, 0, entity.targetPosition.z);
			const direction = new Vector3();
			direction.subVectors(targetPosition, position);
			direction.y = 0; 

			direction.normalize();

			const speed = parseInt(entity.speed) || 1; 

			const distanceToTarget = position.distanceTo(targetPosition);

			if (distanceToTarget < 1.5) {
				entity.targetPosition = null;
				Sockets.emit('entity:reach', {
					entity: entity.id,
					position: entity.position
				});
			} else {
					entity.position.x += direction.x * speed;
					entity.position.z += direction.z * speed;

					Sockets.emit('entity:move', {
							direction,
							position: entity.position,
							speed,
							entity: entity.id
					});

			}
		}
	}

	static selectRandomTarget(entity){
		const chunks = Chunks.chunks;
		if(chunks.length) entity.targetPosition = Random.pick(...chunks).position;
	}

	static thinkNoAttackTarget(entity): void {
		entity.restTime.current++;
		if (entity.restTime.current > entity.restTime.currentMax) {
			entity.restTime.current = 0;
			entity.restTime.currentMax = Random.from(entity.restTime.min, entity.restTime.max);
			if (!entity.targetPosition) {
				Entities.selectRandomTarget(entity);
			}
		} else {
			if (!entity.init) {
				entity.init = true;
				if (Random.from(0, 3) === 2) Entities.selectRandomTarget(entity);
			}
			Entities.think(entity);
		}
	}    

	static think(entity){

		const ai = entity.reference.config!.ai || {};

		if(ai.random_movement){
			if(entity.targetPosition) Entities.moveTowardsTarget(entity);
			else Entities.thinkNoAttackTarget(entity);   
		}

	}

	static update(){

		const entitiesWithAi = this.entities.filter(
			e => e.reference.config?.ai
		);

		entitiesWithAi.forEach(e => {
			Entities.think(e);
		});

	}

}