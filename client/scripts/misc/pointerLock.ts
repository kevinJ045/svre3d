// @ts-nocheck
export class PointerLock extends EventTarget {
  private locked: boolean = false;
  private pointerX: number = 0;
  private pointerY: number = 0;
  

  constructor(private canvas: HTMLCanvasElement) {
    super();
    this.init();
  }

  private init() {
    this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
    this.documentExitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

    this.canvas.addEventListener('click', () => {
      this.lockPointer();
    });

    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('mozpointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('webkitpointerlockchange', () => this.onPointerLockChange());

    document.addEventListener('pointerlockerror', () => this.onPointerLockError());
    document.addEventListener('mozpointerlockerror', () => this.onPointerLockError());
    document.addEventListener('webkitpointerlockerror', () => this.onPointerLockError());

    this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
  }

  private lockPointer() {
    if (!this.locked) {
      this.canvas.requestPointerLock();
    }
  }

  private unlockPointer() {
    this.documentExitPointerLock();
  }

  private onPointerLockChange() {
    this.locked = document.pointerLockElement === this.canvas || document.mozPointerLockElement === this.canvas || document.webkitPointerLockElement === this.canvas;
  }

  private onPointerLockError() {
    console.error('Pointer lock failed or was rejected.');
  }

  private onMouseMove(event: MouseEvent) {
    if (this.locked) {
      this.pointerX += event.movementX;
      this.pointerY += event.movementY;
      this.constrainPointer();
      this.dispatchEvent(new Event('move'));
    }
  }

  private constrainPointer() {
    this.pointerX = Math.max(0, Math.min(this.pointerX, this.canvas.getBoundingClientRect().width));
    this.pointerY = Math.max(0, Math.min(this.pointerY, this.canvas.getBoundingClientRect().height));
  }

  public movePointer(x: number, y: number) {
    this.pointerX = x;
    this.pointerY = y;
    this.constrainPointer();
  }

  get pointer(): { x: number; y: number } {
    return { x: this.pointerX, y: this.pointerY };
  }

  public isLocked(){
    return this.locked;
  }
}
