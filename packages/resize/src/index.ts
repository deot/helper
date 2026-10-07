import { ResizeShared } from './shared';

type ResizableListener = (...args: any[]) => any;

type ResizableElement = HTMLElement & {
	__rz__?: Resize;
};

type ResizableOptions = {
	/**
	 * 共用模式：以 shared 注册的元素共用同一个 ResizeObserver，同一轮里所有元素的尺寸变化由一次回调带回
	 * 	- 同一个监听函数在一次回调里只执行一次（即使注册在多个元素上），参数为这些元素中发生变化的 entries
	 * 	- 与默认模式各自登记、互不影响：off 时需传入相同的 options
	 */
	shared?: boolean;
};

// 检测DOM尺寸变化JS
export class Resize {
	el: ResizableElement;

	static of(el: ResizableElement) {
		return new Resize(el);
	}

	/**
	 * Resize.of(el, fn);
	 * @param el ~
	 * @param fn ~
	 * @param options ~
	 * @returns off
	 */
	static on(el: ResizableElement, fn: ResizableListener, options?: ResizableOptions): () => void {
		return options?.shared ? ResizeShared.on(el, fn) : new Resize(el).on(fn);
	}

	/**
	 * 要实现Resize.off(el)，el必须侵入式修改挂上__rz__
	 * @param el ~
	 * @param fn ~
	 * @param options ~
	 * @returns ~
	 */
	static off(el: ResizableElement, fn?: ResizableListener, options?: ResizableOptions): void {
		return options?.shared ? ResizeShared.off(el, fn) : new Resize(el).off(fn);
	}

	listeners: ResizableListener[] = [];

	ro: ResizeObserver | null = null;

	constructor(el: ResizableElement) {
		this.el = el;

		const rz = el.__rz__;
		if (rz && rz instanceof Resize) {
			this.listeners = rz.listeners;
			this.ro = rz.ro;
		}
	}

	handleResize = (entries: ResizeObserverEntry[]) => {
		/* istanbul ignore else -- @preserve */
		if (entries.some(i => i.target === this.el)) {
			this.listeners?.forEach((fn: any) => fn());
		}
	};

	on(fn: ResizableListener) {
		if (typeof ResizeObserver === 'undefined') return () => {};
		if (!this.listeners.length) {
			this.ro = this.ro || new ResizeObserver(this.handleResize);
			this.ro.observe(this.el);

			this.el.__rz__ = this;
		}

		this.listeners.push(fn);

		return () => this.off(fn);
	}

	off(fn?: ResizableListener) {
		if (fn) {
			// 未注册的监听器（indexOf为-1）直接忽略：splice(-1, 1)会误删最后一个；同一元素的实例共享listeners，误删的可能是其他调用方的
			const index = this.listeners.indexOf(fn);
			if (index === -1) return;
			this.listeners.splice(index, 1);
		} else {
			// 原地清空：同一元素的实例共享listeners，换成新数组只改了当前实例，元素上的旧数组仍留着监听器，之后再on不会重新observe
			this.listeners.length = 0;
		}

		if (!this.listeners.length && this.ro) {
			this.ro.disconnect();
		}
	}
}
