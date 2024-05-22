import { Sockets } from "../ping/sockets.js";
import { Entities } from "./entities.js";
import { Items } from "./items.js";
export default class Commands {
    static register(name, f) {
        this.commands[name] = f;
        return this;
    }
    static has(name) {
        return name in this.commands;
    }
    static execute(name, args, ctx = {}) {
        if (this.commands[name]) {
            return this.commands[name](ctx, ...args);
        }
    }
}
Commands.commands = {};
Commands.register('summon', (ctx, x, y, z, entity, variant, data) => {
    if (x == '~')
        x = ctx.playerEntity.position.x;
    if (y == '~')
        y = ctx.playerEntity.position.y;
    if (z == '~')
        z = ctx.playerEntity.position.z;
    ctx.reply('Spawned a ' + entity + ' at ' + x + ',' + y + ',' + z);
    Entities.spawn(entity, { x, y, z }, '', variant, []);
});
Commands.register('tp', (ctx, x, z) => {
    ctx.playerEntity.position.x = parseInt(x) || 0;
    ctx.playerEntity.position.y = 5;
    ctx.playerEntity.position.z = parseInt(z) || 0;
    Sockets.emit('entity:setpos', { entity: ctx.playerEntity.id, position: ctx.playerEntity.position });
});
Commands.register('give', (ctx, itemName, quantity = 1) => {
    const item = Items.create(itemName, parseInt(quantity.toString()));
    ctx.playerEntity.addToInventory(item);
    Sockets.emit('entity:inventory', {
        entity: ctx.playerEntity.id,
        type: 'add',
        item: item,
        action: 'add'
    });
});
