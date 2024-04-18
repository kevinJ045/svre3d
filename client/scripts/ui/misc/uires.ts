import { ResourceMap } from "../../repositories/resources";



export class UIResources {

    static all(){
        return ResourceMap.resources
        .filter(i => i.type == 'ui');
    }

    static parent(id: string){
        return this.all()
        .filter(i => i.parent === id);
    }

}