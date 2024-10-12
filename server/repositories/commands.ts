import { Data } from "../db/db.js";
import { Sockets } from "../ping/sockets.js";
import { Entities } from "./entities.js";
import { Items } from "./items.js";
import { Players } from "./players.js";
import { ItemData } from '../models/item.js';
import { EntityData } from "../models/entity.js";
import { Chunks } from "./chunks.js";


type Selector = {
  type: 'flag' | 'user' | 'entity' | "variant" | "level" | "id",
  value: string | string[],
};

type Context = {
  position: typeof EntityData.prototype.position,
  username: string,
  self: Selector,
  reply: (msg: string) => void
}

type CommandHandler = (ctx: Context, ...args: any[]) => void;

export class CommandParser {
  private handlers: { [key: string]: { handler: CommandHandler, argTypes: string[] }[] } = {};
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  on(command: string, handler: CommandHandler, argTypes: string): this {
    const argTypeArray = argTypes.split(' ');
    if (!this.handlers[command]) {
      this.handlers[command] = [];
    }
    this.handlers[command].push({ handler, argTypes: argTypeArray });
    return this;
  }

  parseCommand(command: string): void {
    const parts = this.splitCommand(command.trim().slice(1));
    const commandName = parts.shift();
    if (!commandName) return;

    const handlers = this.handlers[commandName];
    if (!handlers) return;

    const rawArgs = parts;

    for (const { handler, argTypes } of handlers) {
      if (rawArgs.length <= argTypes.length) {
        const parsedArgs = this.parseArguments(rawArgs, argTypes);
        handler(this.context, ...parsedArgs);
      }
    }
  }

  private splitCommand(command: string): string[] {
    command += "   ";
    const parts: string[] = [];
    let currentPart = '';
    let inSelector = false;
    let inString = false;
    let setNext = false;
    let mergeNext = false;

    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      if (char === '&' && !inSelector) {
        currentPart += ' ' + char;
        setNext = true;
      } else if (char === ' ' && !inSelector && !inString && !setNext) {
        if (currentPart) {
          if(mergeNext){
            parts[parts.length-1] += currentPart;
          } else {
            parts.push(currentPart);
          }
          currentPart = '';
        }
      } else {
        if(char == '"') {
          inString = !inString;
        } else {
          if (char === 'f' && command.slice(i, i + 5) === 'flag.') {
            inSelector = true;
          } else if (char === ']' && inSelector) {
            inSelector = false;
          }
          if(setNext) {
            setNext = false;
            mergeNext = true;
          }
          currentPart += char;
        }
      }
    }
    if (currentPart) {
      parts.push(currentPart);
    }

    return parts;
  }

  private parseArguments(rawArgs: string[], argTypes: string[]): any[] {
    return argTypes.map((type, index) => {
      const rawArg = rawArgs[index];
      if (type.startsWith('int')) {
        return this.parseIntArgument(type, rawArg);
      } else if (type.startsWith('string')) {
        return rawArg;
      } else if (type.startsWith('selector')) {
        return this.parseSelector(rawArg, type);
      }
      return rawArg;
    });
  }

  private parseIntArgument(type: string, rawArg: string): number {
    const defaultMatch = type.match(/^int:(\w+(\.\w+)*|\d+)$/);
    let rawVal = parseInt(rawArg, 10);

    if (defaultMatch) {
      const [, searchProp] = defaultMatch;
      const isDefaultValue = !isNaN(Number(searchProp));
      let contextValue = isDefaultValue ? Number(searchProp) : this.getContextValue(searchProp);

      const isOffset = rawArg?.startsWith('~');
      const offset = isOffset ? (parseInt(rawArg.slice(1), 10) || 0) : 0;
      return isOffset ? contextValue + offset : (rawVal || contextValue);
    }

    return rawVal;
  }

  private getContextValue(path: string): any {
    const props = path.split('.');
    let contextValue = this.context;
    for (const prop of props) {
      if (contextValue[prop] !== undefined) {
        contextValue = contextValue[prop];
      } else {
        throw new Error(`Invalid context key: ${path}`);
      }
    }
    return contextValue as any;
  }

  private parseSelector(selector: string, type: string): Selector[] | undefined {
    if (!selector) {
      const defaultSelector = type.split(':')[1];
      if (!defaultSelector) return undefined;
      const self = this.getContextValue(defaultSelector);
      return self ? [self] : [this.context['self']];
    }

    const selectors = selector.split('&').map(s => s.trim()).map(s => {
      if (s.startsWith('flag.')) {
        const flags = s.slice(5, -1).split(',');
        return { type: 'flag', value: flags } as Selector;
      } else if (s.startsWith('user.')) {
        const user = s.slice(5);
        return { type: 'user', value: user } as Selector;
      } else if (s.startsWith('variant.')) {
        const variant = s.slice(7);
        return { type: 'variant', value: variant } as Selector;
      } else if (s.startsWith('level.')) {
        const level = s.slice(6);
        return { type: 'level', value: level } as Selector;
      } else {
        return { type: 'entity', value: s } as Selector;
      }
    });

    return selectors;
  }
}


export default class Commands {

  static commands: Record<string, { f: CommandHandler, t: string}> = {};

  static register(name: string, f: CommandHandler, t: string) {
    this.commands[name] = { f, t };
    return this;
  }

  static has(name: string) {
    return name in this.commands;
  }

  static execute(name: string, command: string, ctx: Context = {} as any) {
    const parser = new CommandParser(ctx);
    parser
      .on(name, this.commands[name].f, this.commands[name].t)
      .parseCommand(command);
  }

  static selectEntity(selectors: Selector[]): EntityData[] {
    return Entities.entities.filter(entity => {
      return selectors.every(selector => {
        switch (selector.type) {
          case 'flag':
            return (selector.value as string[]).every(flag => flag.startsWith('!') ? !entity.flags.includes(flag.slice(1)) : entity.flags.includes(flag));
          case 'user':
            return entity.data.username === selector.value;
          case 'id':
            return entity.id === selector.value;
          case 'variant':
            return entity.variant === selector.value;
          case 'entity':
            return entity.name === selector.value;
          default:
            return false;
        }
      });
    });
  }
  

}


Commands.register('locate', (ctx: Context, name: string) => {
  const location = Chunks.findSafeSpawnPoint(name);
  ctx.reply('Located biome ' + name + ' at [' + location.x + ' ' + location.z+']');
}, 'string');


Commands.register('spawn', (ctx: Context, x: number, z: number, type: string, variant: string, name: string) => {
  ctx.reply('Spawned a ' + type + ' at ' + x + ',' + z);
  Entities.spawn(type, { x, y: ctx.position.y, z }, name, variant, []);
}, 'int:position.x int:position.z string string string');

Commands.register('tp', (ctx: Context, x: number, z: number, selector: Selector[]) => {
  Commands.selectEntity(selector)
  .forEach(entity => {
    entity.position.x = x || 0;
    entity.position.y = 5;
    entity.position.z = z || 0;
    Sockets.emit('entity:setpos', { entity: entity.id, position: entity.position });
    ctx.reply(`Teleported ${entity.name || entity.type}`);
  });
}, 'int:position.x int:position.z selector:self');


Commands.register('give', (ctx: Context, itemName: string, quantity = 1, selector: Selector[]) => {
  Commands.selectEntity(selector)
  .forEach(entity => {
    const item = Items.create(itemName, quantity);
    entity.addToInventory(item as ItemData);
    Sockets.emit('entity:inventory', {
      entity: entity.id,
      type: 'add',
      item: item,
      action: 'add'
    });
  });
}, 'string int:1 selector:self');


Commands.register('prop', (ctx: Context, propName: string) => {
  if(propName === 'pos'){
    ctx.reply("Current Chunk: " + Chunks.findClose(ctx.position).stringify());
  }
}, 'string');
