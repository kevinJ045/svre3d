
export default class GlobalEmitter {

  private static _eventListeners: {type:string,f:CallableFunction}[] = [];
	static on(type:string,f:CallableFunction){
		this._eventListeners.push({type, f});
		return this;
	}
	static emit(type:string,...args: any[]){
		this._eventListeners
		.filter(e => e.type == type)
		.forEach(e => e.f(...args));
		return this;
	}

}

export const emit = (event: string, data: any) => {
  GlobalEmitter.emit(event, data);
}