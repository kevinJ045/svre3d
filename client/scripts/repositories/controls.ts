import { THREE } from "enable3d";
import { Chunks } from "./chunks";
import { CameraManager } from "./camera";
import { PlayerInfo } from "./player";
import { Keyboard } from "./keyboard";
import { Mouse } from "./mouse";


export class Controls {

	// static keys = new Keyboard

	static controlMode: 0 | 1 = 0;

	static initControls(canvas: HTMLCanvasElement){
		
    // this.camera.layers.set(0);
		Mouse.init(canvas);
		Keyboard.init();
    
    // const pointerDrag = new PointerDrag(canvas);
    // pointerDrag.onMove(delta => {
    //   if (!this.pointerLock) return;
    //   if (!this.pointerLock.isLocked()) return;
    //   const { x, y } = delta;
    //   this.player.moveTop = -y * 3
    //   this.player.moveRight = x * 3
    // });
	}

}