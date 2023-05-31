// import ResizeObserver from 'resize-observer-polyfill';
import { IS_SERVER } from '@deot/helper-shared';
import type { AnyFunction } from '@deot/helper-shared';

export type ResizableElement = HTMLElement & {
	__resizeListeners__?: Array<(...args: unknown[]) => unknown>;
	__ro__?: ResizeObserver;
};

class ResizeManager {
	events: any;

	constructor() {
		/**
		 * TODO
		 * 只传递element也可以销毁
		 */
		this.events = [];
	}

	on(element: ResizableElement, fn: AnyFunction) {
		if (IS_SERVER || !element) return;
		if (!element.__resizeListeners__) {
			element.__resizeListeners__ = [];
			element.__ro__ = new ResizeObserver(this.handleResize);
			element.__ro__.observe(element);
		}
		element.__resizeListeners__.push(fn);
	}

	off(element: ResizableElement, fn: AnyFunction) {
		if (IS_SERVER || !element || !element.__resizeListeners__) return;
		element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
		if (!element.__resizeListeners__.length) {
			element.__ro__?.disconnect();
		}
	}

	handleResize(entries: ResizeObserverEntry[]) {
		for (let entry of entries) {
			const listeners = (entry.target as ResizableElement).__resizeListeners__ || [];
			if (listeners.length) {
				listeners.forEach((fn: any) => fn());
			}
		}
	}
}

export const Resize = new ResizeManager();