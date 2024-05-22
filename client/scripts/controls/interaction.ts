import { PlayerInfo } from "../repositories/player.js";
import { ping } from "../socket/socket.js";



export default class InteractionControl {

  static interact(intersects){
    if(intersects.object.userData.interactionType == 'structure' && intersects.object.userData.lootable){
      InteractionControl.loot(intersects);
    }
  }

  static loot(intersects){
    const chunkObject = intersects.object.parent?.parent;
    if(chunkObject){
      const chunk = chunkObject.userData.info.chunk;
      if(intersects.object.userData.structure.looted) return;
      ping('structure:loot', {
        chunk: chunk.position,
        entity: PlayerInfo.entity.id,
        id: intersects.object.userData.structure.id
      });
    }
  }

}