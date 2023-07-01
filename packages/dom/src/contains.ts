import { IS_SERVER } from '@deot/helper-shared';

export const contains = (el?: HTMLElement | (Window & typeof globalThis) | Document, child?: HTMLElement) => {
	if (IS_SERVER || !child) return false;

	let childRect = child.getBoundingClientRect();
	let elRect: { top: number; right: number; bottom: number; left: number };

	if (!el || [window, document, document.documentElement].includes(el)) {
		elRect = {
			top: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
			left: 0
		};
	} else {
		elRect = (el as HTMLElement).getBoundingClientRect();
	}

	return childRect.top < elRect.bottom 
		&& childRect.bottom > elRect.top 
		&& childRect.right > elRect.left 
		&& childRect.left < elRect.right;
};