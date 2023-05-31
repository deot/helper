import { IS_SERVER } from '@deot/helper-shared';
import { isScroll } from './is-scroll';

export const getScroller = (el: HTMLElement, vertical: string) => {
	if (IS_SERVER) return null;

	let parent = el;
	while (parent) {
		if ([window, document, document.documentElement].includes(parent)) {
			return window;
		}
		let parent$ = getScroller(parent, vertical);
		if (isScroll(parent$ as HTMLElement, vertical)) {
			return parent;
		}
		
		parent = parent?.parentNode as HTMLElement;
	}

	return parent;
};