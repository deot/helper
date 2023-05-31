import { IS_SERVER } from '@deot/helper-shared';

export const contains = (el: HTMLElement, child: HTMLElement) => {
	if (IS_SERVER || !child) return false;

	let childRect = child.getBoundingClientRect();
	let elRect: { top: number; right: number; bottom: number; left: number };

	if ([window, document, document.documentElement, null, undefined].includes(el)) {
		elRect = {
			top: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
			left: 0
		};
	} else {
		elRect = el.getBoundingClientRect();
	}

	return childRect.top < elRect.bottom 
		&& childRect.bottom > elRect.top 
		&& childRect.right > elRect.left 
		&& childRect.left < elRect.right;
};