import { ServerData } from "../../models/data.ts";
import { Entities } from "../../repositories/entities.ts";
import { ResourceMap } from "../../repositories/resources.ts";
import { ResourceSchema } from "./Schema.type.ts";



export default class CoffeeContext {
  context: Record<string, any> = {};
  constructor(packageData: ResourceSchema, serverData: ServerData){
    const ctx = this.context;
    ctx.World = {
      find: {
        user: (username: string) => Entities.entities.find(i => i.data.username == username),
        id: (id: string) =>  Entities.entities.find(i => i.id == id),
        type: (type: string) => Entities.entities.filter(i => i.reference.manifest.id == type)
      },
      on: (event: string, f: CallableFunction) => serverData.on(event, (data: any) => f(data))
    }
    ctx.Registry = {
      register: (data: ResourceSchema) => packageData.data.push(data)
    },
    ctx.sleep = (time: number) => new Promise((r) => setTimeout(r, time));
  }
}