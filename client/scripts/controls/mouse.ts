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

      

      const intersectsPlayer = raycaster.intersectObjects([PlayerInfo.entity.object3d]);

      if(intersectsPlayer.length > 0){
        // PlayerInfo.entity.addToInventory(Items.create(new ItemData().setData({
        //   itemID: 'i:rubidium',
        //   quantity: 1
        // })));
        console.log(PlayerInfo.entity.flags);
      } else if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        if(PlayerInfo.entity.object3d.position.distanceTo(intersectionPoint) < 3 && intersects[0].object.name !== 'chunk' && intersects[0].object.userData.lootable){
          const chunkObject = intersects[0].object.parent?.parent;
          if(chunkObject){
            const chunk = chunkObject.userData.info.chunk;
            if(intersects[0].object.userData.structure.looted) return;
            ping('structure:loot', {
              chunk: chunk.position,
              entity: PlayerInfo.entity.id,
              id: intersects[0].object.userData.structure.id
            });
          }
        } else {
          PlayerInfo.entity.displace(intersectionPoint, true);
        }
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

    const _glowItems: any[] = [];
    const glowItem = (object, remove) => {
      const hi = object => {
        
        if(Array.isArray((object as any).material)){
          (object as any).material.forEach(mat => {
            if(remove){
              if(mat.userData.originalIntensity) {
                mat.emissiveIntensity = mat.userData.originalIntensity;
                delete mat.userData.originalIntensity;
              }
            }
            else
              if(mat.emissiveIntensity > 0 && !mat.userData.originalIntensity){
                mat.userData.originalIntensity = mat.emissiveIntensity;
                mat.emissiveIntensity = 100;
              }
          });
        } else {
          if(remove)
            if((object as any).material && (object as any).material.userData.originalIntensity){
              (object as any).material.emissiveIntensity = (object as any).material.userData.originalIntensity;
              delete (object as any).material.userData.originalIntensity;
            }
          else 
            if((object as any).material && (object as any).material.emissiveIntensity > 0 && !(object as any).material.userData.originalIntensity){
              (object as any).material.userData.originalIntensity = (object as any).material.emissiveIntensity;
              (object as any).material.emissiveIntensity = 100;
            }
        }

      };
      object.traverse(hi);
    }
    const glowItems = (intersects) => {
      if(!intersects) intersects = [];
      if(intersects[0]?.object.name !== 'chunk' && intersects[0]?.object.userData.lootable){
        const chunkObject = intersects[0].object.parent?.parent;
        if(chunkObject){
          if(_glowItems.indexOf(intersects) < 0) _glowItems.push(intersects);
          glowItem(chunkObject, false);
        }
      }
      _glowItems.forEach(item => {
        if(intersects[0]?.object.uuid !== item[0].object.uuid){
          glowItem(item[0].object.parent?.parent, true);
        }
      });
    }

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
          if(intersects[0].object.name !== 'chunk' && intersects[0].object.userData.lootable){
            const chunkObject = intersects[0].object.parent?.parent;
            if(chunkObject){
              chunkObject.userData.originalMaterial = (chunkObject as any).material;
              
              const hi = object => {
                if((object as any).material && (object as any).material.userData.originalIntensity){
                  (object as any).material.emissiveIntensity = (object as any).material.userData.originalIntensity;
                  delete (object as any).material.userData.originalIntensity;
                }

                
                if(Array.isArray((object as any).material)){
                  (object as any).material.forEach(mat => {
                    if(mat.userData.originalIntensity)
                      mat.emissiveIntensity = mat.userData.originalIntensity;
                      delete mat.userData.originalIntensity;
                  });
                }
              };
              chunkObject.traverse(hi);
            }
          }
        }
      } else {
        SceneManager.scene.scene.remove(place);
        if(Controls.controlMode) {
          UISelectedItem.unselect();
        }
      }
      if(!Controls.controlMode) glowItems(intersects);
    }

    canvas.addEventListener('mousemove', itemInfo);
  
  
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