import { IS_SERVER } from './_constants';
import { isScroll } from './is-scroll';

export const getScroller = (el?: HTMLElement, direction?: 'y' | 'x') => {
	if (IS_SERVER || !el) return null;

	let parent = el;
	while (parent) {
		if ([window, document, document.documentElement].includes(parent)) {
			return window;
		}
		if (isScroll(parent as HTMLElement, direction)) {
			return parent;
		}

		parent = parent?.parentNode as HTMLElement;
	}
	return parent;
};
