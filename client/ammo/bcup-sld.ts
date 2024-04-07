import { Project, Scene3D, PhysicsLoader, THREE, ExtendedObject3D, ThirdPersonControls, PointerLock, PointerDrag, JoyStick } from 'enable3d'
import { preload } from './modules/preload'
import { item } from './modules/models/item'
import { CustomScene } from './modules/models/scene'
import { Player } from './modules/player'

import { Keyboard } from "@yandeu/keyboard";

const isTouchDevice = 'ontouchstart' in window;

class MainScene extends CustomScene {
  loader!: Promise<any>
  player!: Player
  keys: Record<string, boolean> = {};
  controls!: ThirdPersonControls;

  keyboard = new Keyboard();

  constructor() {
    super({ key: 'MainScene' })
  }

  async init() {
    console.log('init')

    this.renderer.setPixelRatio(1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
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
      shape: 'box',
      width: 2,
      height: 2.75,
      depth: 2,
      offset: { y: -0.55 }
    });
    o.body.setFriction(1)
    o.body.setAngularFactor(0, 0, 0)
    // this.physics.add.box(pmesh.children[0].children[0].children[0], { y: 5 });
    return new Player(this.physics, o, player);
  }

  async create() {
    console.log('create')
    
    const player = this.playerCharacter();
    this.player = player;
    player.idle();

    // box.body.setPosition()

    

    // player.body.applyForceY(5); 

    // this.physics.add.existing(o);

    // set up scene (light, ground, grid, sky, orbitControls)
    this.warpSpeed()

    // enable physics debug
    this.physics.debug?.enable()

    const box = this.physics.add.box(
      { x: 1, y: 2, z: -10, width: 5, height: 3, depth: 1, mass: 0, collisionFlags: 0 },
      { lambert: { color: 'red', transparent: true, opacity: 0.5 } }
    )

    this.controls = new ThirdPersonControls(this.camera, this.player.player, {
      offset: new THREE.Vector3(0, 2.5, 0),
      targetRadius: 15
    })

    this.camera.rotateZ(Math.PI * 2);

    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    if (!isTouchDevice) {
      const pointerLock = new PointerLock(this.canvas)
      const pointerDrag = new PointerDrag(this.canvas)
      pointerDrag.onMove(delta => {
        if (!pointerLock.isLocked()) return
        const { x, y } = delta
        this.player.moveTop = -y
        this.player.moveRight = x
      })
    }
    
    if (isTouchDevice) {
      const joystick = new JoyStick()
      const axis = joystick.add.axis({
        styles: { left: 35, bottom: 35, size: 100 }
      })
      axis.onMove(event => {
        const { top, right } = event
        this.player.moveTop = top * 3
        this.player.moveRight = right * 3
      })
      const buttonA = joystick.add.button({
        letter: 'A',
        styles: { right: 35, bottom: 110, size: 80 }
      })
      buttonA.onClick(() => this.player.jump())
      const buttonB = joystick.add.button({
        letter: 'B',
        styles: { right: 110, bottom: 35, size: 80 }
      })
      buttonB.onClick(() => (this.player.move = true))
      buttonB.onRelease(() => (this.player.move = false))
    }
  }
  

  update() {
    this.controls.update(this.player.moveRight * 3, -this.player.moveTop * 3)
    if (!isTouchDevice) this.player.moveRight = this.player.moveTop = 0

    const speed = 4
    const v3 = new THREE.Vector3()

    const rotation = this.camera.getWorldDirection(v3)
    const theta = Math.atan2(rotation.x, rotation.z)
    const rotationMan = this.player.player.getWorldDirection(v3)
    const thetaMan = Math.atan2(rotationMan.x, rotationMan.z)
    this.player.player.body.setAngularVelocityY(0)

    const l = Math.abs(theta - thetaMan)
    let rotationSpeed = isTouchDevice ? 2 : 4
    let d = Math.PI / 24

    if (l > d) {
      if (l > Math.PI - d) rotationSpeed *= -1
      if (theta < thetaMan) rotationSpeed *= -1
      this.player.player.body.setAngularVelocityY(rotationSpeed)
    }

    if (this.keys.w === true || this.player.move) {
      if (!this.player.isRunning && !this.player.isJumping) this.player.run({});

      const x = Math.sin(theta) * speed,
        y = this.player.player.body.velocity.y,
        z = Math.cos(theta) * speed

      this.player.player.body.setVelocity(x, y, z);
    } else {
      if (this.player.isRunning && !this.player.isJumping) this.player.idle();
    }
  }
}

PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))
