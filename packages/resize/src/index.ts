import { IS_SERVER } from '@deot/helper-shared';
import type { AnyFunction } from '@deot/helper-shared';

export type ResizableElement = HTMLElement & {
	__resizeListeners__?: Array<(...args: unknown[]) => unknown>;
	__ro__?: ResizeObserver;
};

// 检测DOM尺寸变化JS
export class Resize {
	el: HTMLElement;

	static of(el: ResizableElement) {
		return new Resize(el);
	}

	static on(el: ResizableElement, fn: AnyFunction) {
		if (IS_SERVER || !el) return;
		if (!el.__resizeListeners__) {
			el.__resizeListeners__ = [];
			el.__ro__ = new ResizeObserver(Resize.handleResize);
			el.__ro__.observe(el);
		}
		el.__resizeListeners__.push(fn);
	}

	static off(el: ResizableElement, fn: AnyFunction) {
		if (IS_SERVER || !el || !el.__resizeListeners__) return;
		el.__resizeListeners__.splice(el.__resizeListeners__.indexOf(fn), 1);

		if (!el.__resizeListeners__.length) {
			el.__ro__?.disconnect();
		}
	}

	static handleResize(entries: ResizeObserverEntry[]) {
		for (let entry of entries) {
			const listeners = (entry.target as ResizableElement).__resizeListeners__;
			listeners?.forEach((fn: any) => fn());
		}
	}

	constructor(el: HTMLElement) {
		this.el = el;
	}

	on(fn: AnyFunction) {
		Resize.on(this.el, fn);
		return () => this.off(fn);
	}

	off(fn: AnyFunction) {
		Resize.off(this.el, fn);
		return this;
	}
}