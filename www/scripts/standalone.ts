import { Project, Scene3D, PhysicsLoader, THREE, ExtendedObject3D, PointerLock, PointerDrag, ThirdPersonControls, ExtendedGroup, ExtendedMesh } from 'enable3d'
import { preload } from './modules/preload'
import { item } from './modules/models/item'
import { CustomScene } from './modules/models/scene'
import { Player } from './modules/player'
import { ChunkSet, generateWorldChunk, getDistance, loadChunksAroundPlayer, updateChunks, updateChunkss } from './modules/world'
import { Item } from './modules/models/item2'

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
    return this.findLoadedResource(name, 'objects')!;
  }

  itemFromName(name: string) {
    let item = this.loadedObject(name);
    if(!item) return null;
    return new Item(item);
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

    // pmesh.rotation.y = Math.PI;
    pmesh.position.set(0, -0.4, 0);

    (pmesh.children[0].children[0].children[0] as any).material = new THREE.MeshPhongMaterial({
      color: player.config!.color
    });

    o.add(pmesh);

    o.anims.mixer.clipAction(player.load.animations[0]).reset().play()

    // this.wearAccessory(o, player.config!.brow);
    // this.wearAccessory(o, player.config!.hat);

    // o.rotation.y = Math.PI;
    o.position.y = -8;


    this.add.existing(o);
    this.physics.add.existing(o, { 
      shape: 'concave',
      offset: { y: -0.2 },
      collisionFlags: 0
    });
    o.body.setFriction(0.8)
    o.body.setAngularFactor(0, 0, 0)
    // this.physics.add.box(pmesh.children[0].children[0].children[0], { y: 5 });

    // o.body.applyForceY(5);
    o.body.setGravity(0, -20, 0)

    return new Player(this.physics, o, player);
  }

  async create() {
    console.log('create')
  
    // box.body.setPosition()

    // console.log(this.loaded['m:base_segment']);

    // this.loadedChunks.segment_object = this.loaded['m:segment'].mesh!;

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

    // console.log(this.itemFromName('m:horn-1'));

    player.toInventory(this.itemFromName('m:horn-1')!);

    this.UI.setPlayer(player);

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
    const { lights } = await this.warpSpeed('camera', 'light');

    this.lightSet = lights!;

    const { directionalLight } = lights!;

    var d = 100;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000000;

    // lights?.directionalLight.distance = 200000;

    // this.scene.remove(lights!.directionalLight)

    // this.lightSet.hemisphereLight.intensity -= 100;

    // lights?.directionalLight.

    // enable physics debug
    // this.physics.debug?.enable();

    // this.controls = new ThirdPersonControls(this.camera, this.player.player, {
    //   offset: new THREE.Vector3(0, 2.5, 0),
    //   radius: 5,
    //   targetRadius: 15
    // })

    // const pointerLock = new PointerLock(this.canvas)
    // const pointerDrag = new PointerDrag(this.canvas)
    // pointerDrag.onMove(delta => {
    //   if (!pointerLock.isLocked()) return
    //   const { x, y } = delta
    //   this.player.moveTop = -y
    //   this.player.moveRight = x
    // });

    const keyEvents = {
      // On Space Key Down
      'Down ': () => this.player.jump(),
      'Upe': () => this.toggleInventory(),
      'Downv': () => this.changeCameraAngle()
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

    this.camera.position.set(0, -1, 5);
    this.setupControls();
    this.camera.lookAt(this.player.player.position);
  }

  inventoryOpen = false;

  toggleInventory(){
    if(this.inventoryOpen){
      this.closeInventory();
    } else {
      this.openInventory();
    }
  }

  openInventory(){
    this.inventoryOpen = true;

    this.cameraPosition.offset = new THREE.Vector3(-5, 3, -8);
    this.cameraPosition.diagonal = 4;

    const pt = this.player.player.position.clone();

    pt.x += 4;

    this.cameraPosition.lookat = pt;


    this.UI.show();
  }

  closeInventory(){
    this.cameraPosition.lookat = false;
    this.inventoryOpen = false;
    this.cameraPosition.offset = new THREE.Vector3(-15, 15, -15);
    this.cameraPosition.diagonal = 10;

    this.UI.hide();
  }

  setupControls(){
    let isClick = 1;
	  let mousedowninterval: any;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.loadedChunks.chunkObjects());

      console.log(intersects);

      if (intersects.length > 0) {
        // Move the cube to the position where the ground is clicked
        const intersectionPoint = intersects[0].point;
        this.player.targetLocation = intersectionPoint;
      }
    }

    const pos = new THREE.Vector2();

    this.canvas.addEventListener('mousedown', (event) => {
      mousedowninterval = setTimeout(() => isClick = 0, 300);
      pos.x = event.clientX;
      pos.y = event.clientY;
    });
  
  
    this.canvas.addEventListener('mouseup', (event) => {
      clearTimeout(mousedowninterval);
      if(isClick == 0 || (event.clientX !== pos.x && event.clientY !== pos.y)) return isClick = 1;

      isClick = 1;
      onMouseClick(event);
    });
  }

  cameraPosition : { offset: THREE.Vector3, diagonal: number, lookat: THREE.Vector3 | false, angles: THREE.Vector3[], current: number } = {
    offset: new THREE.Vector3(-15, 15, -15),
    diagonal: 10,
    lookat: false,
    angles: [
      new THREE.Vector3(15, 15, -15),
      new THREE.Vector3(15, 15, 15),
      new THREE.Vector3(-15, 15, 15),
      new THREE.Vector3(-15, 15, -15),
      new THREE.Vector3(15, 15, 0),
      new THREE.Vector3(-15, 15, 0),
    ],
    current: 0
  };

  changeCameraAngle(){
    if(this.cameraPosition.lookat) return;
    this.cameraPosition.current++;
    if(this.cameraPosition.current >= this.cameraPosition.angles.length) this.cameraPosition.current = 0;
    this.cameraPosition.offset = this.cameraPosition.angles[this.cameraPosition.current];
  }

  updateCameraLocation() {
    const playerPosition = this.player.player.position;
    const playerDirection = this.player.player.getWorldDirection(new THREE.Vector3());

    // Set camera offsets based on player's forward direction
    const offsetX = playerDirection.x * this.cameraPosition.offset.x; // Offset in X axis
    const offsetY = this.cameraPosition.offset.y; // Offset in Y axis
    const offsetZ = playerDirection.z * this.cameraPosition.offset.z; // Offset in Z axis

    // Set camera position
    this.camera.position.set(playerPosition.x + offsetX, playerPosition.y + offsetY, playerPosition.z + offsetZ);

    // Make the camera look at the player
    if(this.cameraPosition.lookat) this.camera.lookAt(this.cameraPosition.lookat);
    else this.camera.lookAt(playerPosition);
  }


  update() {

    // this.controls.update(this.player.moveRight * 3, -this.player.moveTop * 3)
    this.player.moveRight = this.player.moveTop = 0

    // var quaternion = new THREE.Quaternion().setFromEuler(this.player.player.rotation);

    // // Get the forward direction vector based on the player's rotation
    // var movementDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
    // var rightDirection = new THREE.Vector3().crossVectors(movementDirection, new THREE.Vector3(0, 1, 0));

    // let speed = this.player.speed + this.player.speedBoost;

    // if(this.keys.shift === true) speed += 2;

    // const v3 = new THREE.Vector3()

    // const rotation = this.camera.getWorldDirection(v3)
    // const theta = Math.atan2(rotation.x, rotation.z)
    // const rotationMan = this.player.player.getWorldDirection(v3)
    // const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
    // this.player.player.body.setAngularVelocityY(0)

    // const l = Math.abs(theta - thetaMan)
    // let rotationSpeed = 4
    // let d = Math.PI / 24

    // if (l > d) {
    //   if (l > Math.PI - d) rotationSpeed *= -1
    //   if (theta < thetaMan) rotationSpeed *= -1
    //   this.player.player.body.setAngularVelocityY(rotationSpeed)
    // }


    // if(this.player.isJumping){

    // } else if(this.keys.w == true && !this.keys.s){
    //   this.player.run({
    //     x: movementDirection.x * -speed,
    //     z: movementDirection.z * -speed
    //   }, this.keys.shift === true);
    // } else if(this.keys.s == true && !this.keys.w){
    //   this.player.run({
    //     x: movementDirection.x * speed/1.5,
    //     z: movementDirection.z * speed/1.5
    //   }, this.keys.shift === true);
    // } else {
    //   if(this.player.isRunning) this.player.run({
    //     x: 0,
    //     z: 0
    //   });
    // }

    // if(this.player.isJumping){

    // } else if(this.keys.a == true && !this.keys.d){
    //   this.player.run({
    //     x: rightDirection.x * speed/1.5,
    //     z: rightDirection.z * speed/1.5
    //   });
    // } else if(this.keys.d == true && !this.keys.a){
    //   this.player.run({
    //     x: rightDirection.x * -speed/1.5,
    //     z: rightDirection.z * -speed/1.5
    //   });
    // } else {
    //   // if(this.player.isRunning) this.player.run({
    //   //   x: 0
    //   // });
    // }

    // if(!this.keys.d && !this.keys.a && !this.keys.s && !this.keys.w) {
    //   if(this.player.isRunning) this.player.idle();
    // }

    if(this.player.isRunning){
      this.player.player.body.setVelocity(this.player.runDirection.x, this.player.player.body.velocity.y, this.player.runDirection.z);
    } else {
      this.player.player.body.setVelocity(0, this.player.player.body.velocity.y, 0);
    }

    if(this.player.targetLocation) this.player.moveTowardsTarget();

    this.updateCameraLocation();

    // updateChunks(this.player.player.position, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.seed);
    
    updateChunks(this.player.player, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.renderDistance, this.seed);
    // updateChunkss(this.player.player.position, this.world, this.chunkSize, this.maxWorldHeight, new Set(), this.seed);
    // this.updateLightPosition();
  }
}

PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))
