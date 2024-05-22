

export default class ControlUtils {

  static _glowItems: any[] = [];
  static glowItems(intersects){

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
                mat.emissiveIntensity = mat.emissiveIntensity * 4;
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
      object?.traverse(hi);
    }
    if(!intersects) intersects = [];
    if(intersects[0]?.object.name !== 'chunk' && intersects[0]?.object.userData.lootable){
      const chunkObject = intersects[0].object.parent?.parent;
      if(chunkObject){
        if(this._glowItems.indexOf(intersects) < 0) this._glowItems.push(intersects);
        glowItem(chunkObject, false);
      }
    }
    this._glowItems.forEach(item => {
      if(intersects[0]?.object.uuid !== item[0].object.uuid){
        glowItem(item[0].object.parent?.parent, true);
      }
    });
  }

}