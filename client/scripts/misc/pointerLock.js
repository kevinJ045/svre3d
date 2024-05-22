// @ts-nocheck
export class PointerLock extends EventTarget {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.locked = false;
        this.pointerX = 0;
        this.pointerY = 0;
        this.init();
    }
    init() {
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
    lockPointer() {
        if (!this.locked) {
            this.canvas.requestPointerLock();
        }
    }
    unlockPointer() {
        this.documentExitPointerLock();
    }
    onPointerLockChange() {
        this.locked = document.pointerLockElement === this.canvas || document.mozPointerLockElement === this.canvas || document.webkitPointerLockElement === this.canvas;
    }
    onPointerLockError() {
        console.error('Pointer lock failed or was rejected.');
    }
    onMouseMove(event) {
        if (this.locked) {
            this.pointerX += event.movementX;
            this.pointerY += event.movementY;
            this.constrainPointer();
            this.dispatchEvent(new Event('move'));
        }
    }
    constrainPointer() {
        this.pointerX = Math.max(0, Math.min(this.pointerX, this.canvas.getBoundingClientRect().width));
        this.pointerY = Math.max(0, Math.min(this.pointerY, this.canvas.getBoundingClientRect().height));
    }
    movePointer(x, y) {
        this.pointerX = x;
        this.pointerY = y;
        this.constrainPointer();
    }
    get pointer() {
        return { x: this.pointerX, y: this.pointerY };
    }
    isLocked() {
        return this.locked;
    }
}
