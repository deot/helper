import { IS_SERVER } from '@deot/helper-shared';
import { getStyle } from './get-style';

export const isScroll = (el: HTMLElement, vertical: string) => {
	if (IS_SERVER) return false;

	let overflow = getStyle(el, `overflow-${vertical ? 'y' : 'x'}`);
	overflow = overflow || getStyle(el, 'overflow');
	return overflow.match(/(scroll|auto)/);
};