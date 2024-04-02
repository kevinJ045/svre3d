import { ExtendedObject3D, THREE } from "enable3d";
import { item } from "./models/item";
import { Item } from "./models/item2";
import { CustomScene } from "./models/scene";
import { Entity } from "./entity";



export class Player extends Entity {

	wearables : Record<string, Item | null> = {
		hat: null,
		eye: null,
		armor: null,
		attachment: null,
	};

	constructor(scene: CustomScene, player: ExtendedObject3D, playerItem: item){
		super(scene, player, playerItem);
	}


	ownItem(item: Item){
		if(item.player?.mesh.uuid == this.mesh.uuid) return true;
		item.setParentPlayer(this);
		return true;
	}

	removeAttachment(mesh: any){
		const { attachment } = this.bone().userData;
		const index = attachment.indexOf(mesh);
		if(index > -1) attachment.splice(index, 1);
	}
	addAttachment(mesh: any){
		this.bone().userData.attachment.push(mesh);
	}


	unwearAccessory(wearable: Item){
		const { item } = wearable;
    if(item.type !== "accessory" || !item) return;
		const head = this.mesh.children[0].children[0].children[0].children[0];
		this.removeAttachment(wearable.mesh);
		head.remove(wearable?.mesh!);
		wearable.mesh = undefined;
		this.toInventory(wearable);
		this.wearables[item.accessory.type] = null;
	}

	bone(){
		const bone = this.mesh.children[0].children[0].children[1];
		if(!bone.userData.attachment) bone.userData.attachment = [];
		return bone;
	}

	head(){
		return this.mesh.children[0].children[0].children[0].children[0];
	}

	eye(){
		return this.mesh.children[0].children[0].children[0].children[1];
	}

	eyePupil(){
		return this.mesh.children[0].children[0].children[0].children[2];
	}

	wearAccessory(wearable: Item){
		const { item } = wearable;
    if(item.type !== "accessory" || !item) return;

		if(!this.inInventory(wearable)) return false;

    const item_mesh = item.mesh!.clone();
    (item_mesh as any).details = item;


		wearable.mesh = item_mesh;

    const head = this.head();
		// head.material = new THREE.MeshBasicMaterial({ color: , opacity: 0.1 })


		if(this.wearables[item.accessory.type]) {
			const w = this.wearables[item.accessory.type];
			this.unwearAccessory(w!);
		}
		
    head.add(item_mesh);
		this.wearables[item.accessory.type] = wearable;
		this.addAttachment(item_mesh);

		this.fromInventory(wearable);

		this.updateInventory(wearable, 'wear');

    item_mesh.position.x += item.config!.position.x;
    item_mesh.position.y += item.config!.position.y;
    item_mesh.position.z += item.config!.position.z;

    if(item.config!.scale){
      item_mesh.scale.x = item.config!.scale.x;
      item_mesh.scale.y = item.config!.scale.y;
      item_mesh.scale.z = item.config!.scale.z;
    }

		item_mesh.userData.defaultPosition = item.config!.position;

		return true;
  }
	
	think(){
		super.think();

		this.mesh.traverse(node => {
			if ((node as any).isBone && node.userData.attachment) {
				const attachment = node.userData.attachment;

				attachment.forEach((attachment) => {
					const parentBoneMatrix = new THREE.Matrix4().copy(attachment.parent.matrixWorld);
					const attachmentMatrix = new THREE.Matrix4().copy(node.matrix);
					const parentPos = new THREE.Vector3();
					parentPos.setFromMatrixPosition(parentBoneMatrix);

					// Get the attachment's position relative to its parent bone
					const attachmentMatrixInWorldSpace = attachmentMatrix.multiply(parentBoneMatrix);
					const position = new THREE.Vector3();
					position.setFromMatrixPosition(attachmentMatrixInWorldSpace);

					// Get the z offset from attachment's user data
					const defaultZOffset = attachment.userData?.defaultPosition?.z || 0;

					// Calculate the z position with the offset relative to the parent bone
					let z = position.y - (parentPos.y + defaultZOffset);

					// Ensure z position doesn't go below the specified default position
					if (z < defaultZOffset) {
						z = defaultZOffset;
					}

					if(z > 0) z = -z;

					attachment.position.z = z;
				});
				
			}
		});

	}

	static entityMeshLoader(scene: CustomScene) {
		const o = new ExtendedObject3D();

    const player = scene.findLoadedResource('m:player', 'objects')!;
    const pmesh = player.mesh!.copy(new THREE.Object3D(), true);

    console.log(player.load);

    scene.animationMixers.add(o.anims.mixer);
    o.anims.mixer.timeScale = 1;

    pmesh.traverse(child => {
      child.castShadow = true
      child.receiveShadow = false
    });

    (pmesh.children[0].children[0].children[0] as any).material = new THREE.MeshPhongMaterial({
      color: player.config!.color
    });

    o.add(pmesh);

    o.anims.mixer.clipAction(player.load.animations[0]).reset().play()

    // this.wearAccessory(o, player.config!.brow);
    // this.wearAccessory(o, player.config!.hat);

    // o.rotation.y = Math.PI;
    o.position.y = -8;


    scene.add.existing(o);
		const p = new this(scene, o, player);
		p.addPhysics(o);

    return p;
	}

	addPhysics(mesh: any) {
    this.physics.add.existing(mesh, {
      // shape: 'box',
      // offset: { z: 0.55, y: -1.25 },
      // collisionFlags: 0,
			// width: 2,
			// depth: 2,
			// height: 2.9
			shape: 'convex',
      offset: { z: 0.55, y: -0.55 }
    });
		mesh.body.setFriction(0.8);
    mesh.body.setAngularFactor(0, 0, 0);
	}

}