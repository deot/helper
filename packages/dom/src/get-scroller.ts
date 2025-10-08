import { IS_SERVER } from './_constants';
import { isScroller } from './is-scroller';
import type { ScrollerOptions } from './is-scroller';

export const getScroller = (el?: HTMLElement, options?: ScrollerOptions) => {
	if (IS_SERVER || !el) return null;

	let parent = el;
	while (parent) {
		if ([window, document, document.documentElement].includes(parent)) {
			return window;
		}
		if (isScroller(parent as HTMLElement, options)) {
			return parent;
		}

		parent = parent?.parentNode as HTMLElement;
	}
	return parent;
};
