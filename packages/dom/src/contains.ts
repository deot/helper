import { IS_SERVER } from './_constants';

export const contains = (el?: Element | Window | Document, child?: Element) => {
	if (IS_SERVER || !child) return false;

	const childRect = child.getBoundingClientRect();
	let elRect: { top: number; right: number; bottom: number; left: number };

	if (!el || el === window || el === document || el === document.documentElement) {
		elRect = {
			top: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
			left: 0
		};
	} else {
		elRect = (el as Element).getBoundingClientRect();
	}

	return childRect.top < elRect.bottom
		&& childRect.bottom > elRect.top
		&& childRect.right > elRect.left
		&& childRect.left < elRect.right;
};
