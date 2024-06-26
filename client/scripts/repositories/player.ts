import { SceneManager } from "../common/sceneman.js";
import CommonUtils from "../common/utils.js";
import { Controls } from "../controls/controls.js";
import InteractionControl from "../controls/interaction.js";
import { Entity } from "../models/entity.js";
import { ping } from "../socket/socket.js";
import { Chunks } from "./chunks.js";
import { Entities } from "./entities.js";
import { Equipments } from "./equipments.js";
import { THREE } from "enable3d";

export interface PlayerLike {
	username: string,
	position: { x: number, y: number, z: number },
	inventory: string[],
	equipment: {
		brow: string
	}
}

export class PlayerInfo {

	static player: PlayerLike = {
		username: "",
		position: { x: 0, y: 0, z: 0 },
		inventory: [],
		equipment: {
			brow: 'brow-1'
		}
	}

	static entity: Entity;

	static setPlayer(player: PlayerLike) {
		this.player = player;
	}

	static setPlayerEntity(entity: Entity) {
		this.entity = entity;
		if (!entity.object3d) return;
		entity.object3d.userData.player = entity;

		entity.on('move', () => {
			entity.position = {
				x: entity.object3d.position.x,
				y: entity.object3d.position.y,
				z: entity.object3d.position.z
			};
			ping('entity:move', {
				entity: entity.id,
				position: entity.position
			});
		});

		entity.on('flags', () => {
			console.log('Changing Flags');
			ping('player:flags', {
				flags: entity.flags,
				id: entity.id
			});
		});
	}

	static get username() {
		return this.player.username;
	}

	static get inventory() {
		return this.player.inventory;
	}

	static get position() {
		return this.player.position;
	}


	static updateEquipmentData() {
		const equipment = {};

		for (let i in PlayerInfo.entity.data.equipment) {
			if (i == 'brow') {
				equipment[i] = Equipments.brows[PlayerInfo.entity.data.equipment[i]];
			} else {
				equipment[i] = PlayerInfo.entity.findItemByData('wid',
					PlayerInfo.entity.data.equipment[i]
				)?.data.wid;
			}
		}

		const returned: string[] = [];

		ping('player:equipment', {
			inventory: (PlayerInfo.entity.inventory.filter(i => i.data.wid).concat(PlayerInfo.entity.data.uneqiupped ? [PlayerInfo.entity.data.uneqiupped] : []).map((i, ind, arr) => {
				return arr.filter(i2 => i2.id == i.id).length > 1 ? (
					returned.includes(i.id) ? null : (() => {
						returned.push(i.id);
						return i;
					})()
				) : i;
			}).filter(i => i !== null) as any[]).map(i => ({ itemID: i.itemID, data: i.data, quantity: i.quantity, id: i.id })),
			equipment,
			username: PlayerInfo.username,
			flags: PlayerInfo.entity.flags
		});
	}

	static attack() {
		const entityDirection = this.entity.object3d.getWorldDirection(new THREE.Vector3()); // Reverse the direction vector

		// Define a maximum angle within which targets are considered to be in front of the entity
		const maxAngle = Math.cos(THREE.MathUtils.degToRad(45)); // Assuming 5 degrees as the maximum angle

		// Define the maximum distance for attack to count
		const maxDistance = this.entity.data.maxReachDistance || 5; // Assuming a maximum distance of 1 unit

		// Filter potential targets
		const potentialTargets = Entities.entities.filter(entity => {
			if (entity.id == this.entity.id) return;
			// Calculate the vector pointing from your entity to the potential target
			const toTarget = entity.object3d.position.clone().sub(this.entity.object3d.position);

			// Check if the target is within the maximum distance
			const distance = toTarget.length();
			if (distance > maxDistance) return false;

			// Normalize the toTarget vector
			toTarget.normalize();

			// Calculate the dot product between entity's direction and the vector to the target
			const dotProduct = entityDirection.dot(toTarget);

			// Check if the target is in front of your entity (dot product is greater than maxAngle)
			return -dotProduct > maxAngle;
		});

		this.entity!.attack(potentialTargets);
	}

	static interact(act = true) {
		let entityDirection = this.entity.object3d.getWorldDirection(new THREE.Vector3());

		entityDirection = entityDirection.multiplyScalar(-1);

		const maxDistance = this.entity.data.maxReachDistance || 5;

		// entityDirection.y = 5;

		const raycaster = new THREE.Raycaster(new THREE.Vector3(
			this.entity.object3d.position.x,
			this.entity.object3d.position.y,
			this.entity.object3d.position.z
		), entityDirection, 0, maxDistance);

		const interactable: THREE.Object3D[] = [];
		Chunks.chunkObjects().forEach(chunk => {
			interactable.push(...chunk.children);
		});

		const playerSize = CommonUtils.getObjectSize(this.entity.object3d);

		const hitBoxes: THREE.Mesh[] = [];

		const bodies = Entities.entities.filter(i => i.id !== this.entity.id)
		.map(i => {
			return i.object3d.userData.$hitbox;
		});

		console.log(raycaster.intersectObjects(bodies));

		const intersects = raycaster.intersectObjects(interactable)
			.filter(i => i.object.userData.lootable)
			.map(i => { i.object.userData.interactionType = 'structure'; return i; })
			.concat(raycaster.intersectObjects(bodies))
			.sort((a, b) => a.distanceToRay! - b.distanceToRay!);

		if (act) {
			if (intersects.length) {
				InteractionControl.interact(intersects[0]);
			}

			this.entity!.attack();
		}

		// hitBoxes.forEach(hitBox => SceneManager.scene.scene.remove(hitBox));

		return intersects;
	}
}
