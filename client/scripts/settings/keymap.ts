


export class KeyMap {
	static keymap = {
		'move.forward': 'w',
		'move.backward': 's',

		'move.left': 'a',
		'move.right': 'd',

		'move.jump': ' ',
		'move.sneak': 'shift',

		'ui.inventory': 'E',
		'ui.pause': 'Escape',
		
		'controls.mode': 'F',
		'camera.angle': 'V'
	}

	static setKey(name: string, key: string){
		KeyMap.keymap[name] = key;
	}

	static setMap(map: Record<string, string>){
		for(let i in map){
			KeyMap.setKey(i, map[i]);
		}
	}

	static getKey(name: string){
		return KeyMap.keymap[name];
	}
}