import { ExtendedObject3D, THREE } from "enable3d";
import { Entity } from "./entity.js";
export class Player extends Entity {
    constructor(scene, player, playerItem) {
        super(scene, player, playerItem);
        this.neutral = false;
        this.health = { base: 30, current: 30 };
        this.defense = { base: 2, current: 2 };
        this.wearables = {
            hat: null,
            eye: null,
            armor: null,
            attachment: null,
        };
        this.physicsOptions = {
            shape: 'convex',
            offset: { z: 0.55, y: -0.55 }
        };
    }
    ownItem(item) {
        if (item.player?.mesh.uuid == this.mesh.uuid)
            return true;
        item.setParentPlayer(this);
        return true;
    }
    removeAttachment(mesh) {
        const { attachment } = this.bone().userData;
        const index = attachment.indexOf(mesh);
        if (index > -1)
            attachment.splice(index, 1);
    }
    addAttachment(mesh) {
        this.bone().userData.attachment.push(mesh);
    }
    attack() {
        const entityDirection = this.mesh.getWorldDirection(new THREE.Vector3()); // Reverse the direction vector
        // Define a maximum angle within which targets are considered to be in front of the entity
        const maxAngle = Math.cos(THREE.MathUtils.degToRad(45)); // Assuming 5 degrees as the maximum angle
        // Define the maximum distance for attack to count
        const maxDistance = this.maxReachDistance; // Assuming a maximum distance of 1 unit
        // Filter potential targets
        const potentialTargets = this.scene.entities.filter(entity => {
            if (entity.id == this.id)
                return;
            // Calculate the vector pointing from your entity to the potential target
            const toTarget = entity.mesh.position.clone().sub(this.mesh.position);
            // Check if the target is within the maximum distance
            const distance = toTarget.length();
            if (distance > maxDistance)
                return false;
            // Normalize the toTarget vector
            toTarget.normalize();
            // Calculate the dot product between entity's direction and the vector to the target
            const dotProduct = entityDirection.dot(toTarget);
            // Check if the target is in front of your entity (dot product is greater than maxAngle)
            return -dotProduct > maxAngle;
        });
        console.log(potentialTargets);
        super.attack(potentialTargets);
    }
    unwearAccessory(wearable) {
        const { item } = wearable;
        if (item.type !== "accessory" || !item)
            return;
        const head = this.mesh.children[0].children[0].children[0].children[0];
        this.removeAttachment(wearable.mesh);
        head.remove(wearable?.mesh);
        wearable.mesh = undefined;
        this.toInventory(wearable);
        this.wearables[item.accessory.type] = null;
    }
    bone() {
        const bone = this.mesh.children[0].children[0].children[1];
        if (!bone.userData.attachment)
            bone.userData.attachment = [];
        return bone;
    }
    head() {
        return this.mesh.children[0].children[0].children[0].children[0];
    }
    eye() {
        return this.mesh.children[0].children[0].children[0].children[1];
    }
    eyePupil() {
        return this.mesh.children[0].children[0].children[0].children[2];
    }
    wearAccessory(wearable) {
        const { item } = wearable;
        if (item.type !== "accessory" || !item)
            return;
        if (!this.inInventory(wearable))
            return false;
        const item_mesh = item.mesh.clone();
        item_mesh.details = item;
        wearable.mesh = item_mesh;
        const head = this.head();
        // head.material = new THREE.MeshBasicMaterial({ color: , opacity: 0.1 })
        if (this.wearables[item.accessory.type]) {
            const w = this.wearables[item.accessory.type];
            this.unwearAccessory(w);
        }
        head.add(item_mesh);
        this.wearables[item.accessory.type] = wearable;
        this.addAttachment(item_mesh);
        this.fromInventory(wearable);
        this.updateInventory(wearable, 'wear');
        item_mesh.position.x += item.config.position.x;
        item_mesh.position.y += item.config.position.y;
        item_mesh.position.z += item.config.position.z;
        if (item.config.scale) {
            item_mesh.scale.x = item.config.scale.x;
            item_mesh.scale.y = item.config.scale.y;
            item_mesh.scale.z = item.config.scale.z;
        }
        item_mesh.userData.defaultPosition = item.config.position;
        return true;
    }
    think() {
        super.think();
        localStorage.setItem('pos', this.mesh.position.x + ',' + this.mesh.position.z);
        // localStorage.setItem('pos', '0,0');
        this.mesh.traverse(node => {
            if (node.isBone && node.userData.attachment) {
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
                    if (z > 0)
                        z = -z;
                    attachment.position.z = z;
                });
            }
        });
    }
    static entityMeshLoader(scene, name = '', pos) {
        const o = new ExtendedObject3D();
        const player = scene.findLoadedResource('m:player', 'objects');
        const pmesh = player.mesh.copy(new THREE.Object3D(), true);
        scene.animationMixers.add(o.anims.mixer);
        o.anims.mixer.timeScale = 1;
        // pmesh.rotation.y = Math.PI;
        pmesh.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = false;
        });
        pmesh.children[0].children[0].children[0].material = new THREE.MeshPhongMaterial({
            color: player.config.color
        });
        o.add(pmesh);
        // o.anims.mixer.clipAction(player.load.animations[0]).reset().play()
        // this.wearAccessory(o, player.config!.brow);
        // this.wearAccessory(o, player.config!.hat);
        o.position.y = -8;
        // o.rotation.y = Math.PI;
        const pp = (localStorage.getItem('pos') || "0,0").split(',').map(Number);
        o.position.x = pp[0];
        o.position.z = pp[1];
        scene.add.existing(o);
        const p = new this(scene, o, player);
        p.addPhysics(o);
        p.variant = player.config.variant;
        o.userData.player = p;
        // p.onAnimation('Idle', () => {
        // 	p.animQueue(setTimeout(() => {
        // 		p.playAnimation('Turn', 1, false, () => {
        // 			p.idle();
        // 		});
        // 	}, Utils.randFrom(10000, 30000)));
        // });
        p.onCollision((otherobject) => {
            if (otherobject.object.name == 'chunk' && otherobject.object.position.y - p.mesh.position.y > 0) {
                p.hasHigherBlocks = true;
            }
        });
        p.onHealth('death', () => {
            localStorage.setItem('pos', '0,0');
            scene.player = scene.entities.summon('m:player');
            scene.UI.setPlayer(scene.player);
        });
        return p;
    }
}
