import { Socket } from "socket.io";
import { ServerData } from "../models/data.js";
import { EntityData } from "../models/entity.js";
import { xyz } from "../models/misc.xyz.js";
import { ResourceMap } from "./resources.js";
import { ping, pingFrom } from "../ping/ping.js";
import { Sockets } from "../ping/sockets.js";
import { ItemData } from "../models/item.js";
import { Items } from "./items.js";
import { Vector3 } from "three";
import { Chunks } from "./chunks.js";
import { Random } from "../common/rand.js";
import { jsonres } from "../models/jsonres.js";
import { ResourceSchema } from "../lib/loader/Schema.type.js";
import { stringifyChunkPosition } from "../common/chunk.ts";
import { xyzTv } from "../../client/scripts/common/xyz.ts";
import Projectiles from "./projectiles.ts";


export class Entities {

	static entities : EntityData[] = [];
	
	static spawn(type: string, position: xyz, name?: string, variant?: string, inventory?: any[], data?: any, exp?: any){
		
		const ref = type == 'item' ? {
			manifes: {
				id: 'm:item',
				type: 'entity'
			},
			base: {
				health: 1
			}
		} as any : ResourceMap.findResource(type);

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

		entity.setReference(ref);


		const v = (ref?.variants || []).find(i => i.name == variant);

		let drops = (ref.entity?.drops || []);

		if(ref.base?.health){
			entity.health = { max: ref.base.health, current: ref.base.health }
		}
		if(ref.base?.damage) entity.damage = ref.base?.damage;
		if(ref.base?.defense) entity.defense = ref.base?.defense;

		if(ref.entity?.flags){
			entity.flags.push(...entity.reference.entity.flags);
		} 

		if(v){
			if(v.drops){
				drops.push(...v.drops);
			}
			if(v.health){
				entity.health = { max: v.health, current: v.health }
			}
			if(v.damage) entity.damage = v.damage;
			if(v.defense) entity.defense = v.defense;
			if(v.flags) entity.flags.push(...v.flags);
		}

		if(drops.length){
			entity.inventory.push(...drops.map(item => Items.create(item.item, item.quantity, item.data)))
		}

		if(entity.reference.entity?.neutral) entity.isNeutral = true;

		Entities.entities.push(entity);

		Sockets.emit('entity:spawn', { entity });

		entity.on('hurt', (damage: number, timeout = 100) => {
			Entities.directDamageEntity(entity, damage, timeout);
		});

		return entity;
	}

	static find(id: string){
		return this.entities.find(e => e.id == id);
	}

	static despawn(entity: string | EntityData){
		if(typeof entity == 'string') entity = Entities.find(entity)!;
		if(!entity) return;
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

		entity.emit('death');

		if(entity.inventory.length){
			entity.inventory.forEach(item => {
				this.spawnItem(item, (entity as EntityData).position);
			});
		}

		this.entities.forEach(e => {
			if(e.attackTarget?.id == (entity as any).id){
				e.attackTarget = null;
				Sockets.emit('entity:attackTarget', {
					entity: e.id,
					target: null
				});
			}
		});

		if(entity.type == 'i:player'){
			entity.inventory = []
			Entities.hp(entity.id, {
				max: entity.health.max,
				current: entity.health.max
			});
			Sockets.emit('player:respawn', { entity, position: entity.data.spawnPoint || Chunks.findSafeSpawnPoint(entity.variant) });
			Sockets.emit('entity:hp', {entity, hp: entity.health});
		} else {
			this.despawn(entity);
		}
	}

	static hp(id, hp){
		this.entities.forEach(entity => {
			if(entity.id == id){
				if(entity.health.current > hp.current) entity.emit('hurt');
				else if(entity.health.current < hp.current) entity.emit('heal');
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
			socket.broadcast.emit('entity:settarget', {entity, position});
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
			Entities.spawn('i:player', {
				x: 0,
				y: 0,
				z: 0
			}, player.username, player.variant, [], { respawn: true, username: player.username, color: player.color, equipment: { brow: player.equipment?.brow || 'i:normal-brow' } })!;
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
					item: item && Object.keys(item).length ? Items.create(item.type, item.quantity)!
					.setData({ id: item.id, data: item.data }) : null,
					action,
					full,
					inventory: full ? entity.inventory : []
				});
			}
		});
	}


	static moveTowardsTarget(entity: EntityData) {
		if (entity.targetPosition) {
			const position = new Vector3(entity.position.x, 0, entity.position.z);
			const targetPosition = new Vector3(entity.targetPosition.x, 0, entity.targetPosition.z);
			const direction = new Vector3();
			direction.subVectors(targetPosition, position);
			direction.y = 0; 

			direction.normalize();

			const speed = parseInt(entity.speed as any) || 1; 

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
							entity: entity.id,
							attack: entity.attackTarget ? true : false
					});

			}
		}
	}

	static selectRandomTarget(entity){
		let chunks = Chunks.chunks
		.filter(chunk => xyzTv(chunk.position).distanceTo(xyzTv(entity.position)) > chunk.chunkSize);
		const ai = entity.reference.entity?.ai;
		if(ai){
			if(ai.movement?.biome){
				chunks = chunks.filter(chunk => (chunk.biome as any).manifest.id == (ai.movement.biome == 'self' ? entity.variant : ai.movement.biome))
			}
			if(ai.movement?.flags){
				chunks = chunks
					.filter(chunk => !ai.movement?.flags.map((flag: string) => flag.startsWith('!') ? 
					!chunk.flags.includes(flag.replace('!', '')) :
					chunk.flags.includes(flag)
				).includes(false))
			}
		}
		if(chunks.length) entity.targetPosition = Random.pick(...chunks).position;
	}

	static attackTarget(entity: EntityData, target: EntityData, timeout = true) {
		const damage = entity.damage;
		const finalDamage = damage - (target.defense || 0);

		if(timeout && entity.reference.entity?.ai && entity.attackInfo.current > 0){
			entity.attackInfo.current  -= 1;
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
		
		if(timeout) entity.attackInfo.current = entity.attackInfo.cooldown;
		
		if(target.reference.entity?.ai?.attack.attackBack){
			if(target.reference.entity?.ai?.attack.attackBack == 'first'
				? true : !target.attackTarget) {
					target.attackTarget = entity;
					Sockets.emit('entity:attackTarget', {
						entity: target.id,
						target: entity.id
					});
				}
		}
	}

	static selectAttackTarget(entity: EntityData) {
    const range = entity.reference.entity?.viewRange || 10;  // Define the attack range here (e.g., 5 units)
    const possibleTargets = this.entities.filter(
			target => target.id !== entity.id &&  
			(entity.reference.entity!.ai.attack?.neutrals ? true : target.isNeutral !== true) && 
			entity.reference.entity!.ai.attack?.targets.map(i => i.id).includes(target.type) &&
			(entity.reference.entity!.ai.attack?.targets.find(i => i.id == target.type).variant ? 
				(
					entity.reference.entity!.ai.attack.targets.find(i => i.id == target.type).variant == 'self'
					? target.variant == entity.variant :
					(
						entity.reference.entity!.ai.attack.targets.find(i => i.id == target.type).variant == '!self'
						? target.variant !== entity.variant
						: (
							target.variant === entity.reference.entity!.ai.attack.targets.find(i => i.id == target.type).variant.startsWith('!')
							? target.variant !== entity.reference.entity!.ai.attack.targets.find(i => i.id == target.type).variant.split('!')[1]
							: target.variant ===  entity.reference.entity!.ai.attack.targets.find(i => i.id == target.type).variant 
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
			Sockets.emit('entity:attackTarget', {
				entity: entity.id,
				target: target.id
			});
			return true;
    }
    return false;
	}

	static thinkNoAttackTarget(entity): void {
		entity.restTime.current++;
		if (entity.restTime.current > entity.restTime.currentMax) {
			entity.restTime.current = 0;
			entity.restTime.currentMax = Random.from(entity.restTime.min, entity.restTime.max);
			if (!entity.targetPosition && entity.ai.movement?.random) {
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
			const reach = entity.reference.entity?.reachRange || 5;  // Define the attack range here (e.g., 5 units)
    
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

				if(entity.reference.entity.ai?.attack?.projectile){
					// this.attackTarget(entity, entity.attackTarget);
					const direction = new Vector3();
					direction.subVectors(xyzTv(entity.attackTarget.position), position);
					if(entity.data.projectileTimeout == undefined) entity.data.projectileTimeout = 0;
					if(entity.data.projectileTimeout <= 0){
						entity.data.projectileTimeout = entity.reference.entity.ai?.attack?.projectile.timeout || 100;
						Projectiles.createProjectile(
							entity,
							direction,
							entity.reference.entity.ai?.attack?.projectile.speed,
							entity.damage,
							entity.reference.entity.ai?.attack?.projectile.object,
							100
						).on('hit', ({ target }) => {
							if(target) this.attackTarget(entity, target, false);
						});
					} else {
						entity.data.projectileTimeout--;
					}
				} else {
					this.attackTarget(entity, entity.attackTarget);
				}
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
			if(!Entities.selectAttackTarget(entity)){
				if(entity.targetPosition) Entities.moveTowardsTarget(entity);
				else Entities.thinkNoAttackTarget(entity);
			}
		}
	}

	static think(entity: EntityData){

		const ai = entity.reference.entity?.ai || {};

		if(ai.attack){
			Entities.thinkAttackTarget(entity);
		} else if(ai.movement.random){
			if(entity.targetPosition) Entities.moveTowardsTarget(entity);
			else Entities.thinkNoAttackTarget(entity);   
		}

		if(entity.health.current <= 0) {
			this.kill(entity);
		}

	}

	static directDamageEntity(entity: EntityData, damage: number, timeout = 300){
		if(entity.data.directDamageTimeout == null) entity.data.directDamageTimeout = timeout;
		if(entity.data.directDamageTimeout <= 10){
			entity.data.directDamageTimeout = timeout;
			Entities.hp(entity.id, {
				current: entity.health.current - damage,
				max: entity.health.max
			});
			Sockets.emit('entity:hp', {
				entity: entity.id,
				hp: entity.health
			});
		} else {
			entity.data.directDamageTimeout--;
		}
	}

	static update(){

		const entitiesWithAi = this.entities.filter(
			e => e.reference.entity?.ai && e.data.ai !== false
		);

		entitiesWithAi.forEach(e => {
			Entities.think(e);
		});

		this.entities.forEach(entity => {
			let closest = Chunks.findClose(entity.position);
			let pos = closest?.position ? stringifyChunkPosition(closest?.position) : "";
			if(entity.stepOn !== pos && closest) closest.emit('stepStart', { target: entity }); 
			entity.stepOn = pos;
			if(closest) {
				closest.emit('step', { target: entity });
			}
		});

	}

}