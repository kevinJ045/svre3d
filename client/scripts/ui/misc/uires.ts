import { ResourceMap } from "../../repositories/resources.js";



export class UIResources {

    static all(){
        return ResourceMap.resources
        .filter(i => i.manifest.type == 'ui');
    }

    static parent(id: string){
        return this.all()
        .filter(i => i.ui.parent === id);
    }

}