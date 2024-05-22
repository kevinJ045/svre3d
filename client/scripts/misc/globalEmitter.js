export default class GlobalEmitter {
    static on(type, f) {
        this._eventListeners.push({ type, f });
        return this;
    }
    static emit(type, ...args) {
        this._eventListeners
            .filter(e => e.type == type)
            .forEach(e => e.f(...args));
        return this;
    }
}
GlobalEmitter._eventListeners = [];
export const emit = (event, data) => {
    GlobalEmitter.emit(event, data);
};
