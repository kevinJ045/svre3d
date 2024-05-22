export class WorldData {
    static get(key, ifNil) {
        return WorldData.worldData[key] || ifNil;
    }
    static set(key, value) {
        WorldData.worldData[key] = value;
        return this;
    }
    static setData(data) {
        for (let i in data) {
            this.set(i, data[i]);
        }
        return this;
    }
}
WorldData.worldData = {};
