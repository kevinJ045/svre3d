import { ChunkData } from "../models/chunk.js";
import { ServerData } from "../models/data.js";
import { EntityData } from "../models/entity.js";
import { ItemData } from "../models/item.js";


export const FunctionalData: {[key: string]: (item: any) => Record<string, CallableFunction>} = {};

FunctionalData.entity = (entity: EntityData) => ({
  isVariant(variant: string){
    return functionalDataEntiry(variant, (v) => v == entity.variant);
  },
  hasFlag(prop: string){
    return functionalDataEntiry(prop, (p) => entity.flags.includes(p));
  }
});

FunctionalData.chunk = (chunk: ChunkData) => ({
  hasFlag(prop: string){
    return functionalDataEntiry(prop, (p) => chunk.flags.includes(p));
  }
});

FunctionalData.item = (item: ItemData) => ({
  hasFlag(prop: string){
    return functionalDataEntiry(prop, (p) => item.flags.includes(p));
  }
});

export function functionalDataEntiry(string: string, callBack: (string: string) => boolean){
  let value = callBack(string.startsWith('!') ? string.replace('!', '') : string)
  return string.startsWith('!') ? !value : value;
}