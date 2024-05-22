export class KeyMap {
    static setKey(name, key) {
        KeyMap.keymap[name] = key;
    }
    static setMap(map) {
        for (let i in map) {
            KeyMap.setKey(i, map[i]);
        }
    }
    static getKey(name) {
        return KeyMap.keymap[name];
    }
}
KeyMap.keymap = {
    'move.forward': 'w',
    'move.backward': 's',
    'move.left': 'a',
    'move.right': 'd',
    'move.jump': ' ',
    'move.sneak': 'shift',
    'ui.interact': 'E',
    'ui.inventory': 'I',
    'ui.chats': '/',
    'ui.pause': 'Escape',
    'controls.mode': 'F',
    'camera.angle': 'V',
    'camera.lock': 'Shift-V'
};
