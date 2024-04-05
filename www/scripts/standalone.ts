import { Project, Scene3D, PhysicsLoader, THREE, ExtendedObject3D, PointerLock, PointerDrag, ThirdPersonControls, ExtendedGroup, ExtendedMesh } from 'enable3d'
import { preload } from './modules/preload'
import { item } from './modules/models/item'
import { CustomScene } from './modules/models/scene'
import { Player } from './modules/player'
import { ChunkSet, updateChunks } from './modules/world'
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

  async create() {
    console.log('create')
  
    // box.body.setPosition()

    // console.log(this.loaded['m:base_segment']);

    // this.loadedChunks.segment_object = this.loaded['m:segment'].mesh!;

    // console.log(this.loaded['m:segment']);

    // this.loadedChunks.chunkTypes.push(
    //   this.loaded['m:grass_segment']
    // )

    const world = new ExtendedObject3D();

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


    const player = Player.entityMeshLoader(this);
    this.player = player;
    player.idle();

    // console.log(this.itemFromName('m:horn-1'));

    const brow = this.itemFromName('m:brow-1')!;
    const horn = this.itemFromName('m:horn-1')!
    player.toInventory(horn);
    player.toInventory(brow);
    player.toInventory(this.itemFromName('m:rubidium')!);
    for(let i = 0; i < 100; i++){
      player.toInventory(this.itemFromName('m:rubidium')!);
    }

    player.wearAccessory(brow);

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
      'Downv': () => this.changeCameraAngle(),
      'DownShift': () => player.sneak('start'),
      'UpShift': () => player.sneak('stop'),
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
    this.camera.lookAt(this.player.mesh.position);
    
    // updateChunks(this.player.mesh, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.renderDistance, this.seed);

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

    this.cameraPosition.offset = new THREE.Vector3(4, 2, -8);

    const pt = this.player.mesh.position.clone();

    pt.x += 4;

    pt.applyEuler(this.player.mesh.rotation);

    this.cameraPosition.lookat = pt;


    this.UI.show();
  }

  closeInventory(){
    this.cameraPosition.lookat = false;
    this.inventoryOpen = false;
    this.cameraPosition.offset = this.cameraPosition.angles[this.cameraPosition.current];

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

      const intersectsplayer = raycaster.intersectObjects([this.player.mesh]);

      if(intersectsplayer.length > 0){
        return this.openInventory();
      }

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.loadedChunks.chunkObjects());

      if (intersects.length > 0) {
        // Move the cube to the position where the ground is clicked
        const intersectionPoint = intersects[0].point;
        this.player.targetLocation = intersectionPoint;
      }
    }

    const pos = new THREE.Vector2();

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (event) => {
      if(event.button == 0){
        mousedowninterval = setTimeout(() => isClick = 0, 300);
        pos.x = event.clientX;
        pos.y = event.clientY;
      } else {
        event.preventDefault();
      }
    });
  
  
    this.canvas.addEventListener('mouseup', (event) => {
      if(event.button == 0){
        clearTimeout(mousedowninterval);
        if(isClick == 0 || (event.clientX !== pos.x && event.clientY !== pos.y)) return isClick = 1;
  
        isClick = 1;
        onMouseClick(event);
      } else {
        event.preventDefault();

        this.player.attack();

      }
    });

  }

  cameraPosition : { offset: THREE.Vector3, diagonal: number, lookat: THREE.Vector3 | false, angles: THREE.Vector3[], current: number } = {
    offset: new THREE.Vector3(0, 200, 0),
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
    const playerPosition = this.player.mesh.position;
    const playerRotation = this.player.mesh.rotation;

    // Convert offsets to a Vector3 based on player's rotation
    const offsetVector = this.cameraPosition.offset.clone();
    offsetVector.applyEuler(playerRotation);

    // Set camera position
    const cameraPosition = new THREE.Vector3().copy(playerPosition).add(offsetVector);
    this.camera.position.copy(cameraPosition);

    // Make the camera look at the player
    if(this.cameraPosition.lookat) this.camera.lookAt(this.cameraPosition.lookat);
    else this.camera.lookAt(playerPosition);
  }


  update() {

    // this.controls.update(this.player.moveRight * 3, -this.player.moveTop * 3)
    this.player.moveRight = this.player.moveTop = 0

    this.entities.forEach((entity) => {
      entity.think();
    });


    this.updateCameraLocation();

    updateChunks(this.player.mesh, this.world, this.chunkSize, this.maxWorldHeight, this.loadedChunks, this.renderDistance, this.seed);
    // updateChunkss(this.player.player.position, this.world, this.chunkSize, this.maxWorldHeight, new Set(), this.seed);
    // this.updateLightPosition();
  }
}

PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))
