import { FunctionalData } from "../functions/functionalProps.ts";
import { ChunkData } from "../models/chunk.ts";
import { ServerData } from "../models/data.ts";
import { EntityData } from "../models/entity.ts";
import { ItemData } from "../models/item.ts";


type Events = {
  [key: string]: ({
    action: 'emit',
    target: string,
    if?: string,
    emit: string
  } | {
    action: string,
    [key: string]: any
  })[]
};
export class EventEmitter {

  static evaluateString(string: string, context: any){
    return eval('('+string+')');
  };

  static itemFunctionalData(item: ServerData | ServerData[]){
    return item instanceof EntityData ? FunctionalData.entity(item) :
      item instanceof ChunkData ? {} : 
      item instanceof ItemData ? {} : {};
  }

  static applyActions(target: ServerData, actions: Events[0], data: any){
    actions.forEach((action) => {
      if(action.action == 'emit'){
        const target = EventEmitter.evaluateString(action.target, data);
        if(!target) return;
        const ifState = EventEmitter.evaluateString(action.if, {
          $target: Array.isArray(target) ? {} : this.itemFunctionalData(target),
          ...data
        });
        if(ifState){
          Array.isArray(target) ?
          target.forEach(i => i.emit(action.emit)) :
          target.emit(action.emit);
        }
      }
    });
  }

  static chunkListeners(chunk: ChunkData){
    if(chunk.biome.events){
      for(let evName in chunk.biome.events){
        let actions = (chunk.biome.events as Events)[evName];
        chunk.on(evName, (data: any) => {
          EventEmitter.applyActions(chunk, actions, {
            trigger: {
              entity: () => data.target
            }
          })
        });
      }
    }
  }

}