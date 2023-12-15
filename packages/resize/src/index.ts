type ResizableListener = (...args: any[]) => any;

type ResizableElement = HTMLElement & {
	__rz__?: Resize;
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
	 * @returns off
	 */
	static on(el: ResizableElement, fn: ResizableListener): Function {
		return new Resize(el).on(fn);
	}

	/**
	 * 要实现Resize.off(el)，el必须侵入式修改挂上__rz__
	 * @param el ~
	 * @param fn ~
	 * @returns ~
	 */
	static off(el: ResizableElement, fn?: ResizableListener): void {
		return new Resize(el).off(fn);
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
			this.listeners.splice(this.listeners.indexOf(fn), 1);
		} else {
			this.listeners = [];
		}

		if (!this.listeners.length && this.ro) {
			this.ro.disconnect();
		}
	}
}
