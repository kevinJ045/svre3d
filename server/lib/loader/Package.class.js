import path from "path";
import Parser from "./Parser.class.js";
import fs from 'fs';
export default class Package {
    constructor(pathname, serverData) {
        this.data = [];
        this.pathname = pathname;
        const mainfile = path.join(pathname, 'main.yaml');
        this.parser = new Parser();
        this.serverData = serverData;
        const mainFileData = this.parser.parseYAML(mainfile);
        this.manifest = mainFileData.manifest;
        this.parser.context.currentID = this.manifest.id;
        this.lookUp(mainFileData.data.lookUp);
        this.script(mainFileData.data.script);
    }
    lookUp(lpath) {
        const lookupPath = path.resolve(this.pathname, lpath);
        const files = fs.readdirSync(lookupPath);
        files.forEach((file) => {
            const filePath = path.join(lookupPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.lookUp(filePath);
            }
            else if (path.extname(file) === '.yaml' && !file.endsWith('.i.yaml')) {
                const parsedData = this.parser.parseYAML(filePath);
                if (parsedData && parsedData.manifest)
                    this.data.push(parsedData);
            }
        });
    }
    script(spath) {
        const scriptPath = path.resolve(this.pathname, spath);
        this.parser.parseCoffee(scriptPath, this);
    }
    findById(id) {
        return this.data.find(i => i.manifest.id == id);
    }
}
