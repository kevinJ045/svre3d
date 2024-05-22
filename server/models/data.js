import * as uuid from 'uuid';
export class ServerData {
    constructor() {
        this.flags = [];
        this._eventListeners = [];
        this.id = uuid.v4();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    updateTimestamp() {
        this.updatedAt = new Date();
    }
    setReference(reference) {
        this.reference = reference;
        return this;
    }
    setData(data) {
        const d = this;
        for (let i in data) {
            if (data[i] !== null)
                d[i] = data[i];
        }
        return this;
    }
    static from(data, args) {
        // @ts-ignore
        let d = new this(...(args || []));
        d.setData(data);
        return d;
    }
    static create(model, data, args) {
        // @ts-ignore
        let d = new model(...(args || []));
        d.setData(data);
        return d;
    }
    on(type, f) {
        this._eventListeners.push({ type, f });
        return this;
    }
    emit(type, ...args) {
        this._eventListeners
            .filter(e => e.type == type)
            .forEach(e => e.f(...args));
        return this;
    }
}
