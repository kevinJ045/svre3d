import { Project, Scene3D, PhysicsLoader, THREE, ExtendedObject3D, PointerLock, PointerDrag, ThirdPersonControls, ExtendedGroup, ExtendedMesh } from 'enable3d'
import { preload } from './modules/preload'
import { item } from './modules/models/item'
import { CustomScene } from './modules/models/scene'
import { Player } from './modules/player'
import { ChunkSet, generateWorldChunk, getDistance, loadChunksAroundPlayer, updateChunks, updateChunkss } from './modules/world'

class MainScene extends CustomScene {
  loader!: Promise<any>
  player!: Player
  keys: Record<string, boolean> = {};

  constructor() {
    super({ key: 'MainScene' })
  }

  async init() {
    console.log('init')

    this.renderer.setPixelRatio(1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)


    this.loadedChunks = new ChunkSet(this, this.seed);
  }

  async preload() {
    await preload(this);
  }

  loadedObject(name: string) : item {
    return this.loaded[name];
  }

  wearAccessory(player: ExtendedObject3D, accessoryName: string){
    const item = this.loadedObject(accessoryName);
    if(item.type !== "accessory" || !item) return;

    const item_mesh = item.mesh!.clone();
    (item_mesh as any).details = item;

    const head = player.children[0].children[0].children[0].children[0];

    if((player as any)[item.accessory.type]) head.remove((player as any)[item.accessory.type]);

    head.add(item_mesh);
    (player as any)[item.accessory.type] = item_mesh;
    
    item_mesh.position.x += item.config!.position.x;
    item_mesh.position.y += item.config!.position.y;
    item_mesh.position.z += item.config!.position.z;

    if(item.config!.scale){
      item_mesh.scale.x = item.config!.scale.x;
      item_mesh.scale.y = item.config!.scale.y;
      item_mesh.scale.z = item.config!.scale.z;
    }
  }

  playerCharacter(){
    const o = new ExtendedObject3D();

    const player = this.loadedObject('m:player');
    const pmesh = player.mesh!.copy(new THREE.Object3D(), true);

    this.animationMixers.add(o.anims.mixer);
    o.anims.mixer.timeScale = 1;

    pmesh.traverse(child => {
      child.castShadow = true
      child.receiveShadow = false
    });

    pmesh.rotation.y = Math.PI;
    pmesh.position.set(0, -0.4, 0);

    (pmesh.children[0].children[0].children[0] as any).material = new THREE.MeshPhongMaterial({
      color: player.config!.color
    });

    o.add(pmesh);

    o.anims.mixer.clipAction(player.load.animations[0]).reset().play()

    this.wearAccessory(o, player.config!.brow);
    this.wearAccessory(o, player.config!.hat);

    this.add.existing(o);
    this.physics.add.existing(o, { 
      shape: 'concave',
      offset: { y: -0.2 },
      collisionFlags: 0
    });
    o.body.setFriction(0.8)
    o.body.setAngularFactor(0, 0, 0)
    // this.physics.add.box(pmesh.children[0].children[0].children[0], { y: 5 });

    o.body.applyForceY(5);

    return new Player(this.physics, o, player);
  }

  async create() {
    console.log('create')
  
    // box.body.setPosition()

    // console.log(this.loaded['m:base_segment']);

    this.loadedChunks.segment_object = this.loaded['m:segment'].mesh!;

    // console.log(this.loaded['m:segment']);

    // this.loadedChunks.chunkTypes.push(
    //   this.loaded['m:grass_segment']
    // )

    const world = new ExtendedGroup();

    world.position.set(0, -15, 0);

    this.world = world;
    (world as any).physics = this.physics;
    (world as any).player = this.player;

    // world.receiveShadow = true;

    this.add.existing(world);

    // loadChunksAroundPlayer(
    //   new THREE.Vector3(0, 0, 0),
    //   world,
    //   this.chunkSize,
    //   this.maxWorldHeight,
    //   this.seed,
    //   this.loadedChunks
    // );

    // console.log(this.loadedChunks.keys())


    const player = this.playerCharacter();
    this.player = player;
    player.idle();

    // const physics = this.physics;
    // world.children[0].traverse(child => {
    //   if((child as any).isMesh){
    //     physics.add.existing(child as any, {
    //       shape: 'concave',
    //       mass: 0,
    //       collisionFlags: 1,
    //       autoCenter: false
    //     })
    //     (child as any).body.setAngularFactor(0, 0, 0)
    //     (child as any).body.setLinearFactor(0, 0, 0)
    //   }
    // });

    // set up scene (light, ground, grid, sky, orbitControls)
    // this.warpSpeed('-ground');
    const { lights, ground } = await this.warpSpeed('camera', 'light', 'ground');
    
    this.lightSet = lights!;

    // lights?.directionalLight.distance = 200000;

    // this.scene.remove(lights!.directionalLight)

    // this.lightSet.hemisphereLight.intensity -= 100;

    // lights?.directionalLight.

    // enable physics debug
    // this.physics.debug?.enable();

    this.controls = new ThirdPersonControls(this.camera, this.player.player, {
      offset: new THREE.Vector3(0, 2.5, 0),
      radius: 5,
      targetRadius: 15
    })

    const pointerLock = new PointerLock(this.canvas)
    const pointerDrag = new PointerDrag(this.canvas)
    pointerDrag.onMove(delta => {
      if (!pointerLock.isLocked()) return
      const { x, y } = delta
      this.player.moveTop = -y
      this.player.moveRight = x
    });

    const keyEvents = {
      // On Space Key Down
      'Down ': () => this.player.jump()
    }

    window.addEventListener('keydown', (e) => {
      e.preventDefault();
      this.keys[e.key.toLowerCase()] = true;
      this.keys.ctrlKey = e.ctrlKey;
      if(keyEvents['Down'+e.key]) keyEvents['Down'+e.key]();
    });

    window.addEventListener('keyup', (e) => {
      e.preventDefault();
      this.keys[e.key.toLowerCase()] = false;
      this.keys.ctrlKey = e.ctrlKey;
      if(keyEvents['Up'+e.key]) keyEvents['Up'+e.key]();
    });

  
  }

  updateLightPosition(){
    for(let i in this.lightSet){
      const diffX = this.player.player.position.x - this.lightSet[i].position.x;
      const diffZ = this.player.player.position.z - this.lightSet[i].position.z;
      this.lightSet[i].position.set(
        this.player.player.position.x,
        this.lightSet[i].position.y,
        this.player.player.position.z
      )
    }
  }

  update() {

    this.controls.update(this.player.moveRight * 3, -this.player.moveTop * 3)
    this.player.moveRight = this.player.moveTop = 0

    var quaternion = new THREE.Quaternion().setFromEuler(this.player.player.rotation);

    // Get the forward direction vector based on the player's rotation
    var movementDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
    var rightDirection = new THREE.Vector3().crossVectors(movementDirection, new THREE.Vector3(0, 1, 0));

    let speed = this.player.speed + this.player.speedBoost;

    if(this.keys.shift === true) speed += 2;

    const v3 = new THREE.Vector3()

    const rotation = this.camera.getWorldDirection(v3)
    const theta = Math.atan2(rotation.x, rotation.z)
    const rotationMan = this.player.player.getWorldDirection(v3)
    const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
    this.player.player.body.setAngularVelocityY(0)

    const l = Math.abs(theta - thetaMan)
    let rotationSpeed = 4
    let d = Math.PI / 24

    if (l > d) {
      if (l > Math.PI - d) rotationSpeed *= -1
      if (theta < thetaMan) rotationSpeed *= -1
      this.player.player.body.setAngularVelocityY(rotationSpeed)
    }


    if(this.player.isJumping){

    } else if(this.keys.w == true && !this.keys.s){
      this.player.run({
        x: movementDirection.x * -speed,
        z: movementDirection.z * -speed
      }, this.keys.shift === true);
    } else if(this.keys.s == true && !this.keys.w){
      this.player.run({
        x: movementDirection.x * speed/1.5,
        z: movementDirection.z * speed/1.5
      }, this.keys.shift === true);
    } else {
      if(this.player.isRunning) this.player.run({
        x: 0,
        z: 0
      });
    }

    if(this.player.isJumping){

    } else if(this.keys.a == true && !this.keys.d){
      this.player.run({
        x: rightDirection.x * speed/1.5,
        z: rightDirection.z * speed/1.5
      });
    } else if(this.keys.d == true && !this.keys.a){
      this.player.run({
        x: rightDirection.x * -speed/1.5,
        z: rightDirection.z * -speed/1.5
      });
    } else {
      // if(this.player.isRunning) this.player.run({
      //   x: 0
      // });
    }

    if(!this.keys.d && !this.keys.a && !this.keys.s && !this.keys.w) {
      if(this.player.isRunning) this.player.idle();
    }

    if(this.player.isRunning){
      this.player.player.body.setVelocity(this.player.runDirection.x, this.player.player.body.velocity.y, this.player.runDirection.z);
    } else {
      this.player.player.body.setVelocity(0, this.player.player.body.velocity.y, 0);
    }

    // updateChunks(this.player.player.position, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.seed);
    
    updateChunks(this.player.player, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.renderDistance, this.seed);
    // updateChunkss(this.player.player.position, this.world, this.chunkSize, this.maxWorldHeight, new Set(), this.seed);
    // this.updateLightPosition();
  }
}

PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))
