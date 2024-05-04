import { Entity } from "./entity.js";
import { Goober } from "./goober.js";
import { CustomScene } from "./models/scene.js";
import { Player } from "./player.js";


export class Entities {

	_entities: Record<string, typeof Entity> = {};

	entities: Entity[] = [];

	scene: CustomScene;

	constructor(scene: CustomScene){
		this.scene = scene;
		this.registerAll();
	}

	summon(id: string, name = '', pos?: THREE.Vector3){
		return this._entities[id].entityMeshLoader(this.scene, name, pos);
	}

	register(id: string, c: typeof Entity){
		this._entities[id] = c;
	}

	registerAll(){
		this.register('m:player', Player);
		this.register('m:goober', Goober);
	}


	add(entity: Entity){
		this.entities.push(entity);
	}

	remove(entity: Entity){
		this.entities.splice(this.entities.indexOf(entity), 1);
		this.entities.forEach(i => {
			if(i.attackTarget && i.attackTarget!.id == entity.id) i.attackTarget = null;
		});
	}

	allEntities(){
		return this.entities;
	}


	think(){
		this.entities.forEach((entity) => {
      entity.think();
    });
	}

	filter(g){
		return this.entities.filter(g);
	}

}