import { CameraManager } from "./camera";
import { Chunks } from "../repositories/chunks";
import { Controls } from "./controls";
import { PlayerInfo } from "../repositories/player";
import { THREE } from "enable3d";
import { Items } from "../repositories/items";
import { ItemData } from "../../../server/models/item";

export class Mouse {

	static init(canvas: HTMLCanvasElement){
		let isClick = 1;
	  let mousedowninterval: any;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, CameraManager.camera);
      const intersects = raycaster.intersectObjects(Chunks.chunkObjects());

      

      const intersectsPlayer = raycaster.intersectObjects([PlayerInfo.entity.object3d]);

      if(intersectsPlayer.length > 0){
        PlayerInfo.entity.addToInventory(Items.create(new ItemData().setData({
          itemID: 'm:rubidium',
          quantity: 1
        })));
      } else if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        PlayerInfo.entity.displace(intersectionPoint);
      }

    }

    const pos = new THREE.Vector2();

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    canvas.addEventListener('mousedown', (event) => {
      if(event.button == 0){
        mousedowninterval = setTimeout(() => isClick = 0, 300);
        pos.x = event.clientX;
        pos.y = event.clientY;
      } else {
        event.preventDefault();
      }
    });
  
  
    canvas.addEventListener('mouseup', (event) => {
      if(event.button == 0){
        clearTimeout(mousedowninterval);
        if(isClick == 0 || (event.clientX !== pos.x && event.clientY !== pos.y)) return isClick = 1;
  
        isClick = 1;
        if(Controls.controlMode == 0) onMouseClick(event);
      } else {
        event.preventDefault();

        PlayerInfo.attack();

      }
    });

	}

}