import { THREE } from "enable3d";
import { Item } from "./models/item2.js";
import { materialParser } from "./shaderMaterial.js";
import { ItemEntity } from "./itementity.js";
import { TextGeometry } from "../lib/TextGeometry.js";
import { Random } from "../../../server/common/rand.js";
export class Entity {
    constructor(scene, mesh, data) {
        this.items = 0;
        this.inventory = [];
        this.isRunning = false;
        this.isJumping = false;
        this.isSneaking = false;
        this.fast = false;
        this.move = false;
        this.moveTop = 0;
        this.moveRight = 0;
        this.runDirection = {
            x: 0,
            y: 0,
            z: 0
        };
        this.name = '';
        this.speed = 10;
        this.speedBoost = 0;
        this.rotationSpeed = 10;
        this.canJump = true;
        this.alive = true;
        this.targetLocation = null;
        this.health = {
            base: 10,
            current: 10
        };
        this.defense = {
            base: 0,
            current: 0
        };
        this.damage = {
            base: 1,
            current: 1
        };
        this.attackTarget = null;
        this.maxLookDistance = 4;
        this.maxReachDistance = 3;
        this.exp = {
            level: 1,
            max: 100,
            current: 0,
            multipliers: {
                damage: 1,
                defense: 1,
                health: 1
            }
        };
        this._animationTimeout = 0;
        this._animationListeners = [];
        this._animationQueues = [];
        this.physicsOptions = { shape: 'convex' };
        this.attacked = false;
        this.attackCooldown = 200;
        this.damageTimeout = 0;
        this._healthListeners = [];
        this._xpListeners = [];
        this.hasHigherBlocks = false;
        this._inventoryListeners = [];
        this._collisionListeners = [];
        this.variant = "";
        this.neutral = true;
        this.mesh = mesh;
        this.entityData = data;
        this.physics = scene.physics;
        this.scene = scene;
        this.id = THREE.MathUtils.generateUUID();
        scene.entities.add(this);
    }
    _playAnimation(action, speed = 1, loop = true, callback) {
        let name = action;
        if (this.entityData.config?.animations?.[name])
            name = this.entityData.config?.animations[name];
        if (Array.isArray(name))
            name = Random.pick(...name);
        let anim = this.entityData.load.animations.find(anim => anim.name == name);
        if (this.mesh.anims.mixer.timeScale != speed)
            this.mesh.anims.mixer.timeScale = speed;
        this.mesh.anims.mixer.stopAllAction();
        if (anim) {
            clearTimeout(this._animationTimeout);
            if (this._animationQueues.length)
                this._animationQueues.forEach(i => this.removeAnimQueue(i));
            const a = this.mesh.anims.mixer
                .clipAction(anim);
            a.reset();
            if (!loop)
                a.loop = THREE.LoopOnce;
            a.clampWhenFinished = true;
            a.play();
            this._animationTimeout = setTimeout(() => {
                if (typeof callback == "function")
                    callback();
            }, a.getClip().duration * 1000);
            if (this._animationListeners.length)
                this._animationListeners.filter(i => i.name == action).forEach(i => i.fn());
            return a;
        }
        return null;
    }
    onAnimation(name, fn, done = false) {
        this._animationListeners.push({ name, fn, done });
        return this;
    }
    ;
    offAnimation(fn) {
        const f = this._animationListeners.find(i => i.fn == fn);
        if (f) {
            const index = this._animationListeners.indexOf(f);
            this._animationListeners.splice(index, 1);
        }
    }
    animQueue(queue) {
        this._animationQueues.push(queue);
        return this;
    }
    removeAnimQueue(queue) {
        clearTimeout(queue);
        this._animationQueues.splice(this._animationQueues.indexOf(queue));
        return this;
    }
    playAnimation(name, speed = 1, loop = true, callback) {
        return this._playAnimation(name, speed, loop, callback);
    }
    run(direction, speed = false) {
        if ('x' in direction)
            this.runDirection.x = direction.x;
        if ('y' in direction)
            this.runDirection.y = direction.y;
        if ('z' in direction)
            this.runDirection.z = direction.z;
        if (this.isRunning && (this.fast == speed))
            return this;
        // console.log('running');
        this._playAnimation('Walk');
        this.isRunning = true;
        this.fast = speed;
        return this;
    }
    addPhysics(mesh) {
        this.physics.add.existing(mesh, { ...this.physicsOptions });
        mesh.body.setFriction(0.8);
        mesh.body.setAngularFactor(0, 0, 0);
        mesh.body.on.collision((otherObject, event) => {
            if (event == 'collision')
                this.collided({ object: otherObject });
        });
    }
    addPos(x, y, z) {
        this.physics.destroy(this.mesh.body);
        this.mesh.position.x += x;
        this.mesh.position.y += y;
        this.mesh.position.z += z;
        this.addPhysics(this.mesh);
    }
    rotate(degrees) {
        this.physics.destroy(this.mesh.body);
        this.mesh.rotation.y += degrees;
        this.physics.add.existing(this.mesh);
    }
    lookAt(position) {
        this.physics.destroy(this.mesh.body);
        this.mesh.lookAt(position);
        this.physics.add.existing(this.mesh);
    }
    idle() {
        this.isRunning = false;
        this._playAnimation('Idle');
        // console.log('idling')
        return this;
    }
    normal() {
        if (!this.isRunning)
            return this;
        this.isRunning = false;
        this._playAnimation('Normal');
        return this;
    }
    jump() {
        console.log('jumping');
        if (!this.canJump)
            return;
        this.isJumping = true;
        this.canJump = false;
        this.mesh.body.applyForceY(6);
        this.idle();
        this.isJumping = false;
        setTimeout(() => {
            const onc = ({ object }) => {
                if (object.name == 'chunk' && this.canJump == false) {
                    this.canJump = true;
                }
                this.offCollision(onc);
            };
            this.onCollision(onc);
        }, 10);
    }
    sneak(act) {
        if (act == 'start') {
            this.isSneaking = true;
            this._playAnimation('Sneak');
        }
        else {
            this.isSneaking = false;
            if (this.isRunning)
                this._playAnimation('Walk');
            else
                this.idle();
        }
    }
    attack(target) {
        if (this.attacked)
            return;
        this.attacked = true;
        this._playAnimation('Attack', 1, false, () => {
            if (this.isRunning)
                this._playAnimation('Walk');
            else
                this.idle();
        });
        if (target) {
            if (Array.isArray(target))
                target.forEach(target => this.sendDamage(target));
            else
                this.sendDamage(target);
        }
        setTimeout(() => this.attacked = false, this.attackCooldown);
    }
    sendDamage(target) {
        target.recieveDamage(this.damage.base * this.exp.multipliers.damage, this);
    }
    setHealth(health, set = false) {
        const hp = this.health.current;
        this.health.current += health;
        if (set)
            this.health.current = health;
        if (this.health.current < 0) {
            this.updateHealth('before-death', this.health);
        }
        if (this.health.current < 0) {
            this.kill();
            this.updateHealth('death', this.health);
            if (this.previousAttacker?.alive) {
                this.previousAttacker.addExp(this.exp.current);
            }
        }
        else {
            const act = hp < this.health.current ? 'add' : 'sub';
            this.updateHealth(act, this.health);
            this.scene.particleSystem.particle('m:hp', this.mesh.position.clone()
                .add(new THREE.Vector3(0, 3, 0)), {
                heal: act == 'add',
                quantity: health
            });
        }
    }
    recieveDamage(damage, attacker) {
        const finalDamage = damage / this.exp.multipliers.defense;
        this.setHealth(-finalDamage);
        const knockbackDirection = this.mesh.position.clone().sub(attacker.mesh.position).normalize();
        this.previousAttacker = attacker;
        if (this.mesh.body) {
            this.mesh.body.applyForce(knockbackDirection.x * 5, 0, knockbackDirection.z * 5);
        }
    }
    onHealth(type, f) {
        this._healthListeners.push({ type, f });
    }
    updateHealth(type, hp) {
        this._healthListeners.filter(e => e.type == type || e.type == 'all')
            .forEach(e => {
            e.f(this.health, type);
        });
    }
    onXp(type, f) {
        this._xpListeners.push({ type, f });
    }
    updateXp(type, xp) {
        this._xpListeners.filter(e => e.type == type || e.type == 'all')
            .forEach(e => {
            e.f(this.exp, type);
        });
    }
    addExp(xp) {
        this.exp.current += xp;
        this.updateXp('add', this.exp);
        if (this.exp.current >= this.exp.max) {
            const overflow = (this.exp.current - this.exp.max) || 1;
            this.exp.current = overflow;
            this.exp.level++;
            this.exp.max = 100 * this.exp.level;
            this.updateXp('level-up', this.exp);
            this.setHealth(this.health.base, true);
        }
    }
    ;
    subExp(xp) {
        this.exp.current -= xp;
        this.updateXp('sub', this.exp);
        if (this.exp.current <= 0) {
            if (this.exp.level > 1)
                this.exp.level--;
            this.exp.max = 100 * this.exp.level;
            const overflow = -this.exp.current || 1;
            this.exp.current = this.exp.max - overflow;
            this.updateXp('level-down', this.exp);
        }
    }
    ;
    destroy() {
        this.physics.destroy(this.mesh.body);
        this.scene.entities.remove(this);
        this.scene.scene.remove(this.mesh);
    }
    kill() {
        const pos = this.mesh.position.clone();
        this.alive = false;
        this.dropInventory();
        this.destroy();
        this.scene.particleSystem.particle('m:death', pos, {
            rotation: this.mesh.rotation.clone()
        });
    }
    dropInventory() {
        this.inventory.forEach(item => {
            ItemEntity.createItem(this.scene, this.mesh.position.clone(), item);
        });
    }
    ;
    detectObstacles(position, direction) {
        const obstacles = {
            hasSolidObject: false,
            hasHigherBlocks: false,
            hasEntity: false
        };
        const pos = this.mesh.position.clone().add(direction.clone());
        // console.log(pos, position);
        // Perform raycast to detect obstacles in front of the player
        const raycaster = new THREE.Raycaster(pos, position);
        const intersects = raycaster.intersectObjects(this.scene.loadedChunks.chunkObjects(), true);
        const intersectsEntity = raycaster.intersectObjects(this.scene.entities.allEntities().map(i => i.mesh).filter(mesh => mesh.uuid !== this.mesh.uuid), true);
        // console.log(intersects);
        if (intersects.length > 0) {
            // intersects[0].object.material = new THREE.MeshBasicMaterial({ color: 0x09d0d0 });
            // console.log(intersects[0].object);
            const chunkY = intersects[0].object.position.y; // Y position of the chunk below next step
            const playerY = this.mesh.position.y; // Y position of the player
            const heightDifference = chunkY - playerY;
            // if (intersects[0].object.name == 'chunk') {
            // 	intersects[0].object.material = new THREE.MeshBasicMaterial({color: 0x00ffff});
            // 	console.log(heightDifference);
            // }
            // If the height difference is exactly 1, make the player jump
            if (intersects[0].object.name == 'chunk' && heightDifference > -1) {
                obstacles.hasHigherBlocks = true;
            }
            if (intersects[0].object.children.some(i => i.name.startsWith('chunk.'))) {
                obstacles.hasSolidObject = true;
            }
        }
        if (intersectsEntity.length > 0) {
            obstacles.hasEntity = true;
        }
        if (this.hasHigherBlocks) {
            this.hasHigherBlocks = false;
            obstacles.hasHigherBlocks = true;
        }
        return obstacles;
    }
    avoidObstacles(position, obstacles) {
        const avoidanceDirection = new THREE.Vector3();
        // Avoidance behavior based on detected obstacles
        if (obstacles.hasSolidObject) {
            // Move away from solid objects
            avoidanceDirection.subVectors(position, obstacles.closestSolidObject.position).normalize();
        }
        else if (obstacles.hasHigherBlocks) {
            // Move upwards to avoid higher blocks
            avoidanceDirection.set(0, 1, 0);
        }
        else {
            // No specific avoidance behavior, move in a random direction
            avoidanceDirection.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }
        return avoidanceDirection;
    }
    rotateTowardsTarget(target) {
        if (this.targetLocation || target) {
            const rotationSpeed = this.rotationSpeed;
            const maxRotation = Math.PI / 6; // Maximum rotation angle per frame
            // Calculate the direction vector towards the target location
            const direction = new THREE.Vector3();
            direction.subVectors((this.targetLocation || target), this.mesh.position);
            // direction.x = 0; // Assuming movement is only along x and z axes
            direction.y = 0; // Assuming movement is only along x and z axes
            // direction.z = 0; // Assuming movement is only along x and z axes
            var quaternion = new THREE.Quaternion().setFromEuler(this.mesh.rotation);
            const currentDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
            let theta = Math.atan2(direction.x, direction.z) - Math.atan2(currentDirection.x, currentDirection.z);
            if (theta > Math.PI) {
                theta -= 2 * Math.PI;
            }
            else if (theta < -Math.PI) {
                theta += 2 * Math.PI;
            }
            const deltaTheta = THREE.MathUtils.clamp(theta, -maxRotation, maxRotation);
            // console.log(deltaTheta, Math.abs(deltaTheta), deltaTheta * rotationSpeed);
            // console.log(Math.abs(deltaTheta * rotationSpeed));
            if (Math.abs(deltaTheta * rotationSpeed) < 0.1) {
                this.mesh.body.setAngularVelocityY(0);
                return true;
            }
            else {
                this.run({
                    x: 0,
                    z: 0
                });
                this.mesh.body.setAngularVelocityY(deltaTheta * rotationSpeed);
            }
        }
        return false;
    }
    moveTowardsTarget() {
        if (this.targetLocation) {
            const direction = new THREE.Vector3();
            direction.subVectors(this.targetLocation, this.mesh.position);
            direction.y = 0;
            direction.normalize();
            const speed = (this.speed + this.speedBoost) / (this.isSneaking ? 2 : 1);
            const distanceToTarget = this.mesh.position.distanceTo(this.targetLocation);
            if (distanceToTarget < 1.5) {
                this.targetLocation = null;
                this.mesh.body.setAngularVelocityY(0);
                this.run({
                    x: 0,
                    z: 0
                });
                this.idle();
            }
            else {
                const nextStep = new THREE.Vector3(direction.x, direction.y + 1, direction.z).add(this.mesh.position);
                const obstacles = this.detectObstacles(nextStep, direction);
                // console.log(obstacles.hasHigherBlocks, nextStep, this.mesh.position);
                const looking = this.rotateTowardsTarget();
                if (looking) {
                    if (obstacles.hasHigherBlocks) {
                        this.addPos(0, 2.5, 0);
                        // this.run({ x: 0, z: 0});
                    }
                    else if (obstacles.hasSolidObject || obstacles.hasEntity) {
                        const avoidanceDirection = this.avoidObstacles(nextStep, obstacles);
                        this.run({
                            x: avoidanceDirection.x * speed,
                            z: avoidanceDirection.z * speed
                        });
                    }
                    else {
                        this.run({
                            x: direction.x * speed,
                            z: direction.z * speed
                        });
                    }
                }
            }
        }
    }
    inInventory(item) {
        return this.inventory.find(i => i.id == item.id);
    }
    kindInInventory(item) {
        return this.inventory.filter(i => i.item.id == item.item.id);
    }
    ownItem(item) { }
    toInventory(item, count = 0) {
        const itin = this.kindInInventory(item).find(i => i.count < i.max);
        const addItem = (i) => {
            this.ownItem(i || item);
            this.inventory.push(i || item);
            this.updateInventory(i || item, 'add');
        };
        const finalCount = count || item.count;
        if (finalCount == 0)
            return;
        if (itin) {
            const remainingCapacity = itin.max - itin.count;
            if (remainingCapacity >= finalCount) {
                item.count -= finalCount;
                itin.count += finalCount;
                this.updateInventory(itin, 'update-count');
            }
            else {
                itin.count = itin.max;
                this.updateInventory(itin, 'update-count');
                item.count -= remainingCapacity;
                const i = new Item(item.item);
                i.count = item.count;
                addItem(i);
            }
        }
        else {
            addItem();
            return true;
        }
    }
    rmInventory(item) {
        this.inventory.splice(this.inventory.indexOf(item), 1);
        this.updateInventory(item, 'remove');
    }
    fromInventory(item, count = 0) {
        const ini = this.kindInInventory(item).sort(i => i.max - i.count)[0];
        if (!ini)
            return false;
        const rm = () => {
            this.rmInventory(ini);
        };
        if (count) {
            ini.count -= count;
            if (ini.count < 1)
                rm();
            else
                this.updateInventory(ini, 'update-count');
        }
        else {
            rm();
        }
        return true;
    }
    updateInventory(item, type) {
        this._inventoryListeners.filter(f => f.type == type || f.type == 'all').forEach(c => {
            c.f(item, type);
        });
    }
    ;
    onInventory(type, f) {
        this._inventoryListeners.push({
            f,
            type
        });
        return true;
    }
    baseThinking() {
        if (this.targetLocation)
            this.moveTowardsTarget();
        if (this.runDirection.x || this.runDirection.z) {
            this.mesh.body.setVelocity(this.runDirection.x, this.mesh.body.velocity.y, this.runDirection.z);
        }
        else {
            this.mesh.body.setVelocity(0, this.mesh.body.velocity.y, 0);
        }
    }
    think() {
        this.baseThinking();
    }
    onCollision(f) {
        this._collisionListeners.push(f);
        return this;
    }
    offCollision(f) {
        this._collisionListeners.splice(this._collisionListeners.indexOf(f), 1);
        return this;
    }
    collided(data) {
        this._collisionListeners.forEach(f => f(data));
    }
    setVariant(variant, variables = {}) {
        if (variant.objects) {
            variant.objects.forEach(object => {
                const obj = this.scene.findLoadedResource(object.name, 'objects');
                if (!obj)
                    return;
                if (object.count > 1) {
                }
                else {
                    const m = obj.mesh.clone();
                    const t = object.position == "auto" ?
                        (obj.config?.position ? obj.config?.position : { x: 0, y: 0, z: 0 })
                        : (typeof object.position == "object" ? object.position : { x: 0, y: 0, z: 0 });
                    m.position.set(t.x, t.y, t.z);
                    this.mesh.add(m);
                }
            });
        }
        if (variant.material) {
            const m = materialParser(variant.material, this.scene, variables);
            if (m) {
                this.setBodyMaterial(m);
            }
        }
        if (variant.drops) {
            variant.drops.forEach(drop => {
                const item = this.scene.items.itemFromName(drop.item);
                if (item) {
                    item.count = Array.isArray(drop.count) ? Random.from(drop.count[0], drop.count[1]) : drop.count;
                    if (item.count > 0) {
                        this.toInventory(item);
                    }
                }
            });
        }
        if ("set-data" in variant) {
            const data = variant['set-data'];
            this.setData(data);
        }
        this.variant = variant.name;
    }
    setData(data) {
        for (let i in data) {
            if (typeof this[i] !== "function" && this[i]) {
                this[i] = typeof this[i] == "object" ? {
                    ...this[i],
                    ...data[i]
                } : data[i];
            }
        }
    }
    setBodyMaterial(m) { }
    addTextAbove() {
        const textContent = `${this.name}\nHealth: ${this.health.current}/${this.health.base}\nLevel: ${this.exp.level}`;
        const font = this.scene.findLoadedResource('m:base_font', 'fonts').load;
        const textParams = {
            font: font,
            size: 0.5,
            height: 0.01,
            curveSegments: 12,
            bevelEnabled: false
        };
        const textGeometry = new TextGeometry(textContent, textParams);
        // Create a material for the text (you can adjust the color and other properties)
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // Create a mesh for the text using the geometry and material
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        const box = new THREE.Box3().setFromObject(this.mesh);
        const sizeParent = new THREE.Vector3();
        box.getSize(sizeParent);
        textMesh.position.y += sizeParent.y + 4; // Adjust the height offset as needed
        textMesh.rotation.y = Math.PI / 2;
        // Add the text mesh as a child of the entity mesh
        this.mesh.add(textMesh);
    }
    static entityMeshLoader(scene, name, pos) {
        return {};
    }
}
