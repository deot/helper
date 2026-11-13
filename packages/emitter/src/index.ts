/**
 * 微型事件Pub/Sub模块
 * - 支持订阅事件，可单个，多个或者监听器（都会执行）
 * - 支持多个相同事件同时绑定，当某个事件返回`return false`; 不会继续执行
 */

export class Emitter {
	static of(context?: any) {
		return new Emitter(context);
	}

	// 无原型对象，避免`toString`、`constructor`等事件名与原型链属性冲突
	events: Record<string, Function[]> = Object.create(null);

	listeners: Function[] = [];

	context: any;

	constructor(context?: any) {
		this.context = context || null;
	}

	on(event: string | object | Function, callback?: Function) {
		/* istanbul ignore else -- @preserve */
		if (typeof event === 'object') {
			for (const key in event) {
				/* istanbul ignore else -- @preserve */
				if (event[key] && (typeof event[key] === 'function')) {
					this.on(key, event[key]);
				}
			}
		} else if (typeof event === 'string' && typeof callback === 'function') {
			this.events[event] || (this.events[event] = []);
			this.events[event].push(callback);
		} else if (typeof event === 'function') {
			this.listeners.push(event);
		}

		return this;
	}

	off(event?: string, callback?: Function) {
		/* istanbul ignore else -- @preserve */
		if (typeof event === 'string' && !callback) {
			delete this.events[event];
		} else if (typeof event === 'string' && this.events[event] && callback) {
			// `origin`用于匹配`once`的包装函数
			this.events[event] = this.events[event].filter((item: any) => item !== callback && item.origin !== callback);
			this.events[event].length === 0 && delete this.events[event];
		} else if (typeof event === 'undefined') {
			this.listeners = [];
		}
		return this;
	}

	once(event: string, callback: Function) {
		const self = this.context;
		/* istanbul ignore else -- @preserve */
		if (typeof event === 'string' && typeof callback === 'function') {
			const fn: Function & { origin?: Function } = (...args: any[]) => {
				this.off(event, fn);
				return callback.apply(self, args);
			};
			fn.origin = callback;
			this.on(event, fn);
		}
		return this;
	}

	emit(event?: any, ...args: any[]) {
		const self = this.context;
		// 遍历的是快照：回调内的`on/off/once`不影响本轮执行，下一轮生效
		// 每个订阅器都会触发，直到某个返回false
		const callbacks = this.events[event]?.slice();
		if (callbacks?.length) {
			for (let i = 0; i < callbacks.length; i++) {
				if (callbacks[i].apply(self, args) === false) break;
			}
		}

		// 每个监听器都会触发，直到某个返回false
		const listeners = this.listeners.slice();
		for (let i = 0; i < listeners.length; i++) {
			if (listeners[i].apply(self, [event].concat(args)) === false) break;
		}

		return this;
	}
}
