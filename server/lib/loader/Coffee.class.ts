
import coffee from "coffeescript";
import fs from 'fs';
import { Context, createContext, runInContext } from 'vm';
import CoffeeContext from "./Context.class.ts";

export default class Coffee {
  compiled: string;
  src: object;

  context: Context;

  constructor(path, src){
    const coffeeScript = fs.readFileSync(path, 'utf8');
    const compiled = coffee.compile(coffeeScript, { bare: true });
    this.compiled = compiled;
    this.src = src;

    this.context = createContext({
      print: (...logs: any[]) => console.log(...logs),
      source: src,
      ...new CoffeeContext(src, src.serverData)
      .context
    });

  }

  exec(){
    runInContext(this.compiled, this.context);
  }

}