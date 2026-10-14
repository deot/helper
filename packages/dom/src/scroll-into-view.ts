import { IS_SERVER } from './_constants';

interface Options {
	from?: number;
	to?: number;
	duration?: number;
	signal?: AbortSignal;
}

// 每个滚动元素上正在进行的动画的取消函数
const running = new WeakMap<HTMLElement | Window, () => void>();

/**
 * el 必须是滚动的(TODO: 使用getScroller获得滚动或使用scroller参数)
 * TODO: 这个后续还需要优化
 * https://github.com/yiminghe/dom-scroll-into-view
 * 同一元素上的新调用会取消未完成的旧动画，也可以通过 signal 主动取消；取消后 Promise 立即 resolve
 * @param el ~
 * @param options ~
 * @returns ~
 */
export const scrollIntoView = async (
	el: HTMLElement | Window,
	options?: Options
): Promise<any> => {
	if (IS_SERVER) return;

	const { from = 0, to = 0, duration = 300, signal } = options || {};
	if (signal?.aborted) return;

	// 多段动画同时写 scrollTop 会来回抖动，只保留最新的一段
	running.get(el)?.();

	const difference = Math.abs(from - to);
	const step = Math.ceil((difference / duration) * 50);

	let frame: number | undefined;
	let onResolve: Function;
	const target = new Promise((resolve) => {
		onResolve = resolve;
	});
	const stop = () => {
		frame && window.cancelAnimationFrame(frame);
		signal?.removeEventListener('abort', stop);
		running.get(el) === stop && running.delete(el);
		onResolve();
	};
	const scroll = (start: number, end: number) => {
		if (start === end) {
			stop();
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
		frame = window.requestAnimationFrame(() => scroll(d, end));
	};

	running.set(el, stop);
	signal?.addEventListener('abort', stop);
	scroll(from, to);

	return target;
};
