export class Keyboard {
    static listen(key, f) {
        this.listeners[key] = f;
    }
    static register(key, prevent = false) {
        this.keys[key] = { pressed: false, prevent };
    }
    static register_keys(keys, prevent = false) {
        keys.forEach(key => this.register(key, prevent));
    }
    static init() {
        window.addEventListener('keydown', (event) => {
            if (event.target.localName == 'input')
                return;
            const key = event.key.toLowerCase();
            if (this.keys[key]) {
                if (this.keys[key].prevent)
                    event.preventDefault();
                this.keys[key].pressed = true;
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.target.localName == 'input')
                return;
            const key = event.key.toLowerCase();
            if (this.keys[key]) {
                if (this.keys[key].prevent)
                    event.preventDefault();
                this.keys[key].pressed = false;
            }
            const keyString = (event.ctrlKey ? 'Ctrl-' : '') +
                (event.altKey ? 'Alt-' : '') +
                (event.shiftKey ? 'Shift-' : '') +
                key.toUpperCase();
            if (keyString in this.listeners) {
                this.listeners[keyString](event);
            }
        });
    }
    static isPressed(key) {
        return this.keys[key]?.pressed ?? false;
    }
}
Keyboard.listeners = {};
Keyboard.keys = {};
