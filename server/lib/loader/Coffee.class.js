import coffee from "coffeescript";
import fs from 'fs';
import { createContext, runInContext } from 'vm';
import CoffeeContext from "./Context.class.js";
export default class Coffee {
    constructor(path, src) {
        const coffeeScript = fs.readFileSync(path, 'utf8');
        const compiled = coffee.compile(coffeeScript, { bare: true });
        this.compiled = compiled;
        this.src = src;
        this.context = createContext({
            print: (...logs) => console.log(...logs),
            source: src,
            ...new CoffeeContext(src, src.serverData)
                .context
        });
    }
    exec() {
        runInContext(this.compiled, this.context);
    }
}
