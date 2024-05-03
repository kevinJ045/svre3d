export function getPropStr(object: Record<string, any>, str: string){
  let ns = str.split('.');
  while(ns.length){
    let n = ns.shift()!;
    if(object[n]){
      object = object[n]
    }
  }
  return object;
}