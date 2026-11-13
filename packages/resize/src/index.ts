import { ResizeShared } from './shared';

export type ResizableListener = (...args: any[]) => any;

export type ResizableSharedListener = (entries: ResizeObserverEntry[]) => any;

export type ResizableOptions = {
	/**
	 * 共用模式：以同一个监听函数注册的元素共用一个 ResizeObserver，同一轮里这些元素的尺寸变化由一次回调带回
	 * 	- 监听函数在一次回调里只执行一次（即使注册在多个元素上），参数为这些元素中发生变化的 entries
	 * 	- 与默认模式各自登记、互不影响：off 时需传入相同的 options
	 */
	shared?: boolean;
};

type ResizableState = {
	listeners: ResizableListener[];
	ro: ResizeObserver | null;
};

/**
 * 元素 -> 默认模式下的监听状态
 *
 * 状态跟着元素走，而不是跟着实例走：同一元素的所有实例（无论创建先后）与静态方法读写的是同一份，
 * 元素被回收时一并回收，不必往元素上挂属性
 */
const states = new WeakMap<Element, ResizableState>();

// 检测DOM尺寸变化JS
export class Resize {
	el: Element;

	static of(el: Element) {
		return new Resize(el);
	}

	/**
	 * Resize.on(el, fn);
	 * @param el ~
	 * @param fn ~
	 * @param options ~
	 * @returns off
	 */
	static on(el: Element, fn: ResizableSharedListener, options: { shared: true }): () => void;
	static on(el: Element, fn: ResizableListener, options?: ResizableOptions): () => void;
	static on(el: Element, fn: ResizableListener, options?: ResizableOptions): () => void {
		return options?.shared ? ResizeShared.on(el, fn) : new Resize(el).on(fn);
	}

	/**
	 * Resize.off(el, fn);
	 * @param el ~
	 * @param fn 省略时删除该元素的全部监听（仅限 options 对应的模式）
	 * @param options ~
	 * @returns ~
	 */
	static off(el: Element, fn?: ResizableListener, options?: ResizableOptions): void {
		return options?.shared ? ResizeShared.off(el, fn) : new Resize(el).off(fn);
	}

	/**
	 * 共用模式：删除监听函数在所有元素上的监听，调用方不必记下元素逐个 off
	 * @param fn ~
	 * @returns ~
	 */
	static disconnect(fn: ResizableListener): void {
		return ResizeShared.disconnect(fn);
	}

	private state: ResizableState;

	constructor(el: Element) {
		this.el = el;

		let state = states.get(el);
		if (!state) {
			state = { listeners: [], ro: null };
			states.set(el, state);
		}
		this.state = state;
	}

	get listeners(): ResizableListener[] {
		return this.state.listeners;
	}

	get ro(): ResizeObserver | null {
		return this.state.ro;
	}

	handleResize = (entries: ResizeObserverEntry[]) => {
		/* istanbul ignore else -- @preserve */
		if (entries.some(i => i.target === this.el)) {
			const { listeners } = this.state;
			const errors: unknown[] = [];
			// 遍历的是快照：监听函数里 off（如只听一次）不会让后面的被跳过，本轮新注册的下一轮才执行；
			// 本轮已被 off 的不再执行
			listeners.slice().forEach((fn) => {
				if (!listeners.includes(fn)) return;
				try {
					fn();
				} catch (e) {
					errors.push(e);
				}
			});

			// 某个监听函数抛错不影响其它监听函数，错误照常抛出：
			// 第一个在全部执行完后原样抛出（与只有它一个时的表现相同），其余的各自异步抛出，不被吞掉
			if (errors.length) {
				errors.slice(1).forEach(e => setTimeout(() => {
					throw e;
				}));
				throw errors[0];
			}
		}
	};

	on(fn: ResizableListener) {
		if (typeof ResizeObserver === 'undefined') return () => {};

		const { state } = this;
		// 同一个监听函数在同一个元素上重复注册只算一次
		if (!state.listeners.includes(fn)) {
			if (!state.listeners.length) {
				state.ro = state.ro || new ResizeObserver(this.handleResize);
				state.ro.observe(this.el);
			}

			state.listeners.push(fn);
		}

		return () => this.off(fn);
	}

	off(fn?: ResizableListener) {
		const { listeners, ro } = this.state;
		if (fn) {
			// 未注册的监听器（indexOf为-1）直接忽略：splice(-1, 1)会误删最后一个，误删的可能是其他调用方的
			const index = listeners.indexOf(fn);
			if (index === -1) return;
			listeners.splice(index, 1);
		} else {
			listeners.length = 0;
		}

		if (!listeners.length && ro) {
			ro.disconnect();
		}
	}
}
