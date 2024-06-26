import { CameraManager } from "./camera.js";
import { Chunks } from "../repositories/chunks.js";
import { Controls } from "./controls.js";
import { PlayerInfo } from "../repositories/player.js";
import { THREE } from "enable3d";
import { Items } from "../repositories/items.js";
import { ItemData } from "../../../server/models/item.js";
import { Entities } from "../repositories/entities.js";
import { UISelectedItem } from "../ui/misc/variables.js";
import { SceneManager } from "../common/sceneman.js";
import { ping } from "../socket/socket.js";
import ControlUtils from "./utils.js";

export class Mouse {

  static firstPerson = false;

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
      const intersectsEntities = raycaster.intersectObjects(Entities.entities.map(i => i.object3d));

      

      const intersectsPlayer = raycaster.intersectObjects([PlayerInfo.entity.object3d]);

      if(intersectsPlayer.length > 0){
        // PlayerInfo.entity.addToInventory(Items.create(new ItemData().setData({
        //   itemID: 'i:rubidium',
        //   quantity: 1
        // })));
      } else if(intersectsEntities.length) {
        const intersectionPoint = intersectsEntities[0].point;
        const gap = 1;
        const displacementVector = new THREE.Vector3(gap, gap, gap);
        intersectionPoint.add(displacementVector);
        PlayerInfo.entity.displace(intersectionPoint, true);
      } else if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        PlayerInfo.entity.displace(intersectionPoint, true);
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

    const place = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshBasicMaterial({ color: 0x000fff, opacity: 0.5 }));


    const itemInfo = (event) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      if(Controls.controlMode){
        mouse.x = 0;
        mouse.y = 0;
        raycaster.far = 5;
      } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.far = (CameraManager.camera as any).far;
      }
    
      raycaster.setFromCamera(mouse, CameraManager.camera);

      const intersects = raycaster.intersectObjects(
        []
        .concat(
          Entities.entities
          .filter(i => i.id !== PlayerInfo.entity.id)
          .map(i => i.object3d) as any
        )
        .concat(
          Chunks.chunkObjects() as any
        ),
        // true
      );

      if(intersects.length){
        let { object, point } = intersects[0];
        while(!(object.parent as any).isScene){
          object = object.parent!;
        }
        if(object.userData.info && object.name !== 'chunk'){
          if(event.type == 'mousemove') UISelectedItem.select(object.userData.info);
        }
        if(object.name == 'chunk'){
          if(!Controls.controlMode){
            place.material.color = new THREE.Color(
              Array.isArray(object.userData.info.chunk.biome.biome.colors) ?
              object.userData.info.chunk.biome.biome.colors[0] : 
              object.userData.info.chunk.biome.biome.colors
            );
            place.position.copy(point);
            SceneManager.scene.scene.add(place);
          }

          
          if(Controls.controlMode) UISelectedItem.unselect();
        } else {
          SceneManager.scene.scene.remove(place);
        }
      } else {
        SceneManager.scene.scene.remove(place);
        if(Controls.controlMode) {
          UISelectedItem.unselect();
        }
      }
      ControlUtils.glowItems(intersects);
    }

    canvas.addEventListener('mousemove', itemInfo);
  
  
    canvas.addEventListener('mouseup', (event) => {
      if(event.button == 0){
        clearTimeout(mousedowninterval);
        if(isClick == 0 || (event.clientX !== pos.x && event.clientY !== pos.y)) return isClick = 1;
  
        isClick = 1;
        if(Controls.controlMode == 0) onMouseClick(event);
        else PlayerInfo.interact();
      } else {
        event.preventDefault();

        PlayerInfo.attack();
      }
    });

	}

}