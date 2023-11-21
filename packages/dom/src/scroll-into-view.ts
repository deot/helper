import { IS_SERVER } from './_constants';

interface Options {
	from?: number;
	to?: number;
	duration?: number;
}

/**
 * el 必须是滚动的(TODO: 使用getScroller获得滚动或使用scroller参数)
 * TODO: 这个后续还需要优化
 * https://github.com/yiminghe/dom-scroll-into-view
 * @param el ~
 * @param options ~
 * @returns ~
 */
export const scrollIntoView = async (
	el: HTMLElement | Window, 
	options?: Options
): Promise<any> => {
	if (IS_SERVER) return;

	let { from = 0, to = 0, duration = 300 } = options || {};
	
	let difference = Math.abs(from - to);
	let step = Math.ceil((difference / duration) * 50);

	let onResolve: Function;
	let target = new Promise((resolve) => {
		onResolve = resolve;
	});
	const scroll = (start: number, end: number) => {
		if (start === end) {
			onResolve();
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
	
	return target;
};