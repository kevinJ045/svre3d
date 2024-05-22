export class Settings {
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
    static new(key, setting) {
        this.settings[key] = setting;
        this.emit('new', { [key]: setting.value });
        return this;
    }
    static type(key) {
        let val = this.get(key);
        if (typeof val == "number") {
            return val.toString().includes('.') ? 'float' : 'int';
        }
        else {
            return typeof val == 'boolean' ? 'bool' : typeof val;
        }
    }
    static get(key, defaultValue) {
        return Settings.getFull(key).value ?? defaultValue;
    }
    static getFull(key) {
        return Settings.settings[key] || {};
    }
    static set(key, value, notify = true) {
        if (!Settings.settings[key])
            Settings.settings[key] = { value };
        else
            Settings.settings[key].value = value;
        // console.log('set', key, value);
        if (notify) {
            this.emit('change', { [key]: value });
            this.emit('change:' + key, value);
        }
        return this;
    }
    static setMap(map) {
        for (let i in map) {
            this.set(i, map[i]);
        }
        return this;
    }
}
Settings.settings = {
    renderDistance: {
        value: 4
    },
    sensitivity: {
        value: 3
    },
    enablePixels: {
        value: false
    },
    pixelLevel: {
        value: 2
    },
    enableBloom: {
        value: true
    },
    ssao: {
        value: false
    },
};
Settings._eventListeners = [];
