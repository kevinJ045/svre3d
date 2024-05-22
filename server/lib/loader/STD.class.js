export default class STD {
    static registerMap(map = {}) {
        for (let i in map) {
            STD.register(i, map[i]);
        }
    }
    static register(name, content) {
        this.schemas[name] = content;
    }
    static find(name) {
        return this.schemas[name];
    }
    static getSchemas() {
        const schemas = [];
        for (let i in this.schemas) {
            schemas.push({ name: i, values: this.schemas[i] });
        }
        return schemas;
    }
}
STD.schemas = {};
