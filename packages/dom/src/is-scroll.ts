import { IS_SERVER } from './_constants';
import { getStyle } from './get-style';

export const isScroll = (el?: HTMLElement, direction?: 'y' | 'x') => {
	if (IS_SERVER || !el) return false;

	let overflow = getStyle(el, `overflow-${direction ? 'y' : 'x'}`);
	overflow = overflow || getStyle(el, 'overflow');

	return !!overflow.match(/(scroll|auto)/);
};
