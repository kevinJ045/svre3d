import { Entity } from "../models/entity.js";
import { PlayerInfo } from "../repositories/player.js";
import { ping } from "../socket/socket.js";
import TradeUI from "../ui/modals/trade.js";



export default class InteractionControl {

  static interact(intersects) {
    if (intersects.object.userData.interactionType == 'structure' && intersects.object.userData.lootable) {
      InteractionControl.loot(intersects);
    } else {
      const i = intersects.object;
      if(i.userData.entity){
        InteractionControl.entity(i.userData.entity);
      }
    }
  }

  static entity(entity: Entity){
    if(entity.data?.trade){
      const trading = entity.data?.trade;
      console.log(trading);
      TradeUI.open(trading);
    }
  }

  static loot(intersects) {
    const chunkObject = intersects.object.parent?.parent;
    if (chunkObject) {
      const chunk = chunkObject.userData.info.chunk;
      if (intersects.object.userData.structure.looted) return;
      ping('structure:loot', {
        chunk: chunk.position,
        entity: PlayerInfo.entity.id,
        id: intersects.object.userData.structure.id
      });
    }
  }

}
