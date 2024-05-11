import { ServerData } from "../models/data.ts";
import { EntityData } from "../models/entity.ts";


export const FunctionalData: {[key: string]: (item: any) => Record<string, CallableFunction>} = {};

FunctionalData.entity = (entity: EntityData) => ({
  isVariant(variant: string){
    return functionalDataEntiry(variant, (v) => v == entity.variant);
  },
  hasProp(prop: string){
    return functionalDataEntiry(prop, (p) => p in entity.data);
  }
});


export function functionalDataEntiry(string: string, callBack: (string: string) => boolean){
  let value = callBack(string.startsWith('!') ? string.replace('!', '') : string)
  return string.startsWith('!') ? !value : value;
}