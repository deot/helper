/**
 * 微型事件Pub/Sub模块
 * - 支持订阅事件，可单个，多个或者监听器（都会执行）
 * - 支持多个相同事件同时绑定，当某个事件返回`return false`; 不会继续执行
 */

export class Emitter {
	static of(context?: any) {
		return new Emitter(context);
	}

	events: object;

	listeners: Array<Function>;

	context: any;

	constructor(context?: any) {
		this.events = {};
		this.listeners = [];

		this.context = context || null;
	}

	on(event: string | object | Function, callback?: Function) {
		if (typeof event === "object") {
			for (let key in event) {
				if (event[key] && (typeof event[key] === "function")) {
					this.on(key, event[key]);
				}
			}
		} else if (typeof event === "string" && typeof callback === "function") {

			this.events[event] || (this.events[event] = []);
			this.events[event].push(callback);

		} else if (typeof event === 'function') {
			this.listeners.push(event);
		}

		return this;
	}

	off(event?: string, callback?: Function) {
		if (typeof event === 'string' && !callback) {
			delete this.events[event];
		} else if (typeof event === 'string' && this.events[event] && callback) { 
			this.events[event] = this.events[event].filter((item: any) => item !== callback);
			this.events[event].length === 0 && delete this.events[event];
		} else if (typeof event === 'undefined') {
			this.listeners = [];
		}
		return this;
	}

	once(event: string, callback: Function) {
		const self = this.context;
		if (typeof event === 'string' && typeof callback === "function") {
			const fn = (...args: any[]) => {
				this.off(event, fn);
				callback.apply(self, args);
			};
			this.on(event, fn);
		}
		return this;
	}

	emit(event?: any, ...args: any[]) {
		const self = this.context;
		const hasBind = this.events[event]?.length;
		// 每个订阅器都会触发，直到某个返回false
		if (hasBind) {
			for (let i = 0; this.events[event] && i < this.events[event].length; i++) {
				if (this.events[event][i].apply(self, args) === false) break;
			}
		}

		// 每个监听器都会触发，直到某个返回false
		for (let i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i].apply(self, [event].concat(args)) === false) break;
		}
		
		return this;
	}
}