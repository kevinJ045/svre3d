import { Data } from "../db/db.js";
import { Sockets } from "../ping/sockets.js";
import { Entities } from "./entities.js";
import { Items } from "./items.js";
import { Players } from "./players.js";
import { ItemData } from '../models/item.js';



export default class Commands {

  static commands: Record<string, CallableFunction> = {};

  static register(name: string, f: CallableFunction) {
    this.commands[name] = f;
    return this;
  }

  static has(name: string) {
    return name in this.commands;
  }

  static execute(name: string, args: string[], ctx = {}) {
    if (this.commands[name]) {
      return this.commands[name](ctx, ...args);
    }
  }

}

type Context = {
  playerEntity: {
    position: {
      x: number,
      y: number,
      z: number,
    }
    id: string,
    addToInventory: (item: ItemData) => Promise<Response>
  }
  reply: (msg: string) => Promise<Response>
}

Commands.register('summon', (ctx: Context, x: number, y: number, z: number, entity: string, variant: string, data) => {
  if (x.toString() == '~') x = ctx.playerEntity.position.x;
  if (y.toString() == '~') y = ctx.playerEntity.position.y;
  if (z.toString() == '~') z = ctx.playerEntity.position.z;
  ctx.reply('Spawned a ' + entity + ' at ' + x + ',' + y + ',' + z);
  Entities.spawn(entity, { x, y, z }, '', variant, []);
});

Commands.register('tp', (ctx: Context, x: number, z: number) => {
  ctx.playerEntity.position.x = parseInt(x.toString()) || 0;
  ctx.playerEntity.position.y = 5;
  ctx.playerEntity.position.z = parseInt(z.toString()) || 0;
  Sockets.emit('entity:setpos', { entity: ctx.playerEntity.id, position: ctx.playerEntity.position });
});


Commands.register('give', (ctx: Context, itemName: string, quantity = 1) => {
  const item = Items.create(itemName, parseInt(quantity.toString()));
  ctx.playerEntity.addToInventory(item as ItemData);
  Sockets.emit('entity:inventory', {
    entity: ctx.playerEntity.id,
    type: 'add',
    item: item,
    action: 'add'
  });
});
