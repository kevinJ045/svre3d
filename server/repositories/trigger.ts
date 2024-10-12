

export const EventTrigger = <T>() => class  {
  
	private static _events: {
		event: string,
		fn: (chunk: T) => void
	}[] = [];

	static on(event: string, fn: (data: T) => void){
		this._events.push({ event, fn });
		return this;
	}

	static off(event: string, fn: (data: T) => void){
		const ev = this._events.find(i => i.event == event && i.fn == fn);
		if(ev) this._events.splice(this._events.indexOf(ev), 1);
		return this;
	}

	static emit(event: string, data: T){
    this._events.filter(i => i.event == event)
    .forEach(e => e.fn(data));
		return this;
	}

}