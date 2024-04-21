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
import { jsonres } from "../models/jsonres";


export class Entities {

	static entities : EntityData[] = [];
	
	static spawn(type: string, position: xyz, name?: string, variant?: string, inventory?: any[], data?: any, exp?: any){
		
		const ref = type == 'item' ? {
			type: 'entity',
			data: {
				type: 'entity',
				config: {
					health: {
						max: 1,
						current: 1
					}
				},
				resource: {
					type: "",
					src: ""
				},
				id: ""
			} as jsonres
		} : ResourceMap.findResource(type);
		
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

		if(entity.reference.config?.neutral) entity.isNeutral = true;

		Entities.entities.push(entity);

		Sockets.emit('entity:spawn', { entity });

		return entity;
	}

	static find(id: string){
		return this.entities.find(e => e.id == id);
	}

	static despawn(entity: string | EntityData){
		if(typeof entity == 'string') entity = Entities.find(entity)!;
		if(entity.attackTarget) entity.attackTarget = null;
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

	static spawnItem(item: ItemData, position: xyz){
		this.spawn(
			'item',
			position,
			item.id,
			undefined,
			undefined,
			{ item }
		);
	}

	static kill(entity: string | EntityData){
		if(typeof entity == 'string') entity = Entities.find(entity)!;

		if(!entity) return;

		if(entity.inventory.length){
			entity.inventory.forEach(item => {
				this.spawnItem(item, (entity as EntityData).position);
			});
		}

		this.entities.forEach(e => {
			if(e.attackTarget?.id == (entity as any).id){
				e.attackTarget = null;
			}
		});

		this.despawn(entity);
	}

	static hp(id, hp){
		this.entities.forEach(entity => {
			if(entity.id == id){
				entity.health = hp;
				if(entity.health.current <= 0){
					this.kill(entity);
				}
			}
		});
	};

	static startPing(socket: Socket, serverdata){
		pingFrom(socket, 'entity:move', ({entity,position}) => {
			Entities.displace(entity, position);
		});

		pingFrom(socket, 'entity:settarget', ({entity,position}) => {
			Entities.target(entity, position);
			socket.broadcast.emit('entity:settarget', {entity, position});
		});

		pingFrom(socket, 'entity:hp', ({entity, hp}) => {
			Entities.hp(entity, hp);
			socket.broadcast.emit('entity:hp', {entity, hp});
		});

		pingFrom(socket, 'entity:attack', ({entity: eid, target: tid}) => {
			const entity = Entities.find(eid);
			const target = Entities.find(tid);
			if(target && entity){
				Entities.attackTarget(entity, target);
			}
		});

		pingFrom(socket, 'entity:collectitem', ({entity:eid, player:pid}) => {
			// Entities.hp(entity, hp);
			// socket.broadcast.emit('entity:hp', {entity, hp});

			const entity = Entities.find(eid);
			const player = Entities.find(pid);
			if(entity && player){
				if(entity.data.item) {
					player.addToInventory(entity.data.item);
					Entities.despawn(entity);
					Sockets.emit('entity:inventory', {
						entity: pid,
						type: 'add',
						item: entity.data.item,
						action: 'add'
					});
				}
			}
		});

		pingFrom(socket, 'player:respawn', (player) => {
			Entities.spawn('m:player', {
				x: 0,
				y: 0,
				z: 0
			}, player.username, player.variant, [], { respawn: true, username: player.username, color: player.color, equipment: { brow: player.equipment?.brow || 'm:brow-1' } })!;
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
		let chunks = Chunks.chunks;
		const ai = entity.reference.config?.ai;
		if(ai){
			if(ai.movement_biome){
				chunks = chunks.filter(chunk => (chunk.biome as any).name == (ai.movement_biome == 'self' ? entity.variant : ai.movement_biome))
			}
		}
		if(chunks.length) entity.targetPosition = Random.pick(...chunks).position;
	}

	static attackTarget(entity: EntityData, target: EntityData) {
		const damage = entity.damage;
		const finalDamage = damage - (target.defense || 0);

		if(entity.attackInfo.current > 0){
			entity.attackInfo.current -= 1;
			return;
		}

		Entities.hp(target.id, {
			max: target.health.max,
			current: target.health.current - finalDamage
		});
		Sockets.emit('entity:hp', {
			entity: target.id,
			hp: target.health
		});
		entity.attackInfo.current = entity.attackInfo.cooldown;
	}

	static selectAttackTarget(entity: EntityData) {
    const range = entity.reference.config?.viewRange || 10;  // Define the attack range here (e.g., 5 units)
    const possibleTargets = this.entities.filter(
			target => target.id !== entity.id &&  
			target.isNeutral !== true && 
			entity.reference.config!.ai.attack.map(i => i.id).includes(target.type) &&
			(entity.reference.config!.ai.attack.find(i => i.id == target.type).variant ? 
				(
					entity.reference.config!.ai.attack.find(i => i.id == target.type).variant == 'self'
					? target.variant == entity.variant :
					(
						entity.reference.config!.ai.attack.find(i => i.id == target.type).variant == '!self'
						? target.variant !== entity.variant
						: (
							target.variant === entity.reference.config!.ai.attack.find(i => i.id == target.type).variant.startsWith('!')
							? target.variant !== entity.reference.config!.ai.attack.find(i => i.id == target.type).variant.split('!')[1]
							: target.variant ===  entity.reference.config!.ai.attack.find(i => i.id == target.type).variant 
						)
					)
				)
			: true) && 
			new Vector3(
				entity.position.x,
				entity.position.y,
				entity.position.z
			).distanceTo(
				new Vector3(
					target.position.x,
					target.position.y,
					target.position.z
				)
			) <= range 
    ).sort((a, b) => new Vector3(
			entity.position.x,
			entity.position.y,
			entity.position.z
		).distanceTo(
			new Vector3(
				b.position.x,
				b.position.y,
				b.position.z
			)
		) - new Vector3(
			entity.position.x,
			entity.position.y,
			entity.position.z
		).distanceTo(
			new Vector3(
				a.position.x,
				a.position.y,
				a.position.z
			)
		));

    if (possibleTargets.length > 0) {
			const target = possibleTargets[0];
			entity.attackTarget = target;
			return true;
    }
    return false;
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

	static thinkAttackTarget(entity: EntityData){
		if(entity.attackTarget){
			const reach = entity.reference.config?.reachRange || 5;  // Define the attack range here (e.g., 5 units)
    
			const position = new Vector3(
				entity.position.x,
				entity.position.y,
				entity.position.z
			);
			const newPosition = new Vector3(
				entity.attackTarget.position.x,
				entity.attackTarget.position.y,
				entity.attackTarget.position.z
			);
			const distance = position.distanceTo(newPosition);
			if(distance < reach) {
				if(entity.targetPosition){
					entity.targetPosition = null;
					Sockets.emit('entity:reach', {
						entity: entity.id,
						position: entity.position
					});
				}

				this.attackTarget(entity, entity.attackTarget);
			} else if(!entity.targetPosition){
				entity.targetPosition = {
					x: newPosition.x,
					y: newPosition.y,
					z: newPosition.z
				};
			} else {
				Entities.moveTowardsTarget(entity);
			} 
		} else {
			Entities.selectAttackTarget(entity);

			if(entity.targetPosition) Entities.moveTowardsTarget(entity);
			else Entities.thinkNoAttackTarget(entity);
		}
	}

	static think(entity){

		const ai = entity.reference.config!.ai || {};

		if(ai.attack){
			Entities.thinkAttackTarget(entity);
		} else if(ai.random_movement){
			if(entity.targetPosition) Entities.moveTowardsTarget(entity);
			else Entities.thinkNoAttackTarget(entity);   
		}

	}

	static update(){

		const entitiesWithAi = this.entities.filter(
			e => e.reference.config?.ai && e.data.ai !== false
		);

		entitiesWithAi.forEach(e => {
			Entities.think(e);
		});

	}

}