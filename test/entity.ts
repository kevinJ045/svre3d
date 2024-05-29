import { ResourceMap } from "../server/repositories/resources";
import { loadAllResources } from "../server/functions/resources";
import { Entities } from "../server/repositories/entities";
import { Sockets } from "../server/ping/sockets";
import { Items } from "../server/repositories/items";

Sockets.io = { emit: () => {} } as any

loadAllResources(ResourceMap, {} as any);

Items.filterItems();

let c = Entities.spawn('i:goober', { x: 0, y: 0, z: 0 })!;

c.addToInventory(Items.create('i:rubidium', 102)!);
c.addToInventory(Items.create('i:rubidium', 102)!);
c.addToInventory(Items.create('i:rubidium', 102)!);

console.log(c.countItemsInInventory(Items.create('i:rubidium')!))

c.removeFromInventory(Items.create('i:rubidium')!, 5);

console.log(c.countItemsInInventory(Items.create('i:rubidium')!))

console.log(c.inventory.map(i => i.itemID + ' * ' + i.quantity).join(', '));