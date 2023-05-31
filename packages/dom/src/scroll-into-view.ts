import { IS_SERVER } from '@deot/helper-shared';

interface Options {
	from?: number;
	to?: number;
	duration?: number;
	onEnd?: Function;
}

/**
 * el 必须是滚动的(TODO: 使用getScroller获得滚动或使用scroller参数)
 * TODO: 这个后续还需要优化
 * https://github.com/yiminghe/dom-scroll-into-view
 * @param {HTMLElement} el ~
 * @param {Options} options ~
 * @returns {void} ~
 */
export const scrollIntoView = (
	el: HTMLElement | Window, 
	options: Options
): void => {
	if (IS_SERVER) return;

	let { from = 0, to = 0, duration = 300, onEnd } = options || {};
	
	let difference = Math.abs(from - to);
	let step = Math.ceil((difference / duration) * 50);

	const scroll = (start: number, end: number) => {
		if (start === end) {
			onEnd && onEnd();
			return;
		}

		let d = (start + step > end) ? end : start + step;
		if (start > end) {
			d = (start - step < end) ? end : start - step;
		}

		if (el === window) {
			window.scrollTo(d, d);
		} else {
			(el as HTMLElement).scrollTop = d;
		}
		window.requestAnimationFrame(() => scroll(d, end));
	};

	scroll(from, to);
};