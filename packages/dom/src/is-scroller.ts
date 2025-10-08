import { IS_SERVER } from './_constants';
import { getStyle } from './get-style';

export interface ScrollerOptions {
	className?: RegExp;
	direction?: 'y' | 'x';
}

export const isScroller = (el?: HTMLElement, options?: ScrollerOptions) => {
	if (IS_SERVER || !el) return false;

	const { className, direction } = options || {};

	let overflow = getStyle(el, `overflow-${direction ? 'y' : 'x'}`);
	overflow = overflow || getStyle(el, 'overflow');

	return !!(overflow.match(/(scroll|auto)/) || className?.test(el.className));
};
