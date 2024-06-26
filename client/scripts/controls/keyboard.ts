

export class Keyboard {
  static listeners: Record<string, CallableFunction> = {};
  static keys: Record<string, { pressed: boolean; prevent: boolean }> = {};

  static listen(key: string, f: CallableFunction) {
    this.listeners[key] = f;
  }

	static register(key: string, prevent = false){
		this.keys[key] = { pressed: false, prevent };
	}

  static register_keys(keys: string[], prevent = false){
    keys.forEach(key => this.register(key, prevent));
  }

  static init() {
    window.addEventListener('keydown', (event) => {
      if((event.target as HTMLElement).localName == 'input') return;
      
      const key = event.key.toLowerCase();
      if (this.keys[key]) {
				if(this.keys[key].prevent) event.preventDefault();
        this.keys[key].pressed = true;
      }
    });

    window.addEventListener('keyup', (event) => {

      if((event.target as HTMLElement).localName == 'input') return;

      const key = event.key.toLowerCase();
      if (this.keys[key]) {
				if(this.keys[key].prevent) event.preventDefault();
        this.keys[key].pressed = false;
      }

			const keyString = 
				(event.ctrlKey ? 'Ctrl-' : '')+ 
				(event.altKey ? 'Alt-' : '')+ 
				(event.shiftKey ? 'Shift-' : '')+ 
				key.toUpperCase();

			if(keyString in this.listeners){
				this.listeners[keyString](event);
			}
    });

  }

  static isPressed(key: string) {
    return this.keys[key]?.pressed ?? false;
  }
}
