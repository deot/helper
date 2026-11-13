import { IS_SERVER } from './_constants';

interface Options {
	from?: number;
	to?: number;
	duration?: number;
	signal?: AbortSignal;
	axis?: 'x' | 'y';
}

// 每个滚动元素上正在进行的动画的取消函数，横纵向互不影响
const running = {
	x: new WeakMap<Element | Window, () => void>(),
	y: new WeakMap<Element | Window, () => void>()
};

/**
 * el 必须是滚动的(TODO: 使用getScroller获得滚动或使用scroller参数)
 * TODO: 这个后续还需要优化
 * https://github.com/yiminghe/dom-scroll-into-view
 * axis 为 'x' 时滚动 scrollLeft，默认 'y' 滚动 scrollTop
 * 按经过的时间线性推进，耗时即 duration，与屏幕刷新率无关；duration 不大于 0 时直接到位
 * 同一元素同一方向上的新调用会取消未完成的旧动画，也可以通过 signal 主动取消；取消后 Promise 立即 resolve
 * @param el ~
 * @param options ~
 * @returns ~
 */
export const scrollIntoView = async (
	el: Element | Window,
	options?: Options
): Promise<void> => {
	if (IS_SERVER) return;

	const { from = 0, to = 0, duration = 300, signal, axis = 'y' } = options || {};
	if (signal?.aborted) return;

	// 多段动画同时写同一方向会来回抖动，只保留最新的一段
	const runningOnAxis = running[axis];
	runningOnAxis.get(el)?.();

	const write = (v: number) => {
		if (el === window) {
			axis === 'x'
				? window.scrollTo(v, window.scrollY)
				: window.scrollTo(window.scrollX, v);
		} else if (axis === 'x') {
			(el as Element).scrollLeft = v;
		} else {
			(el as Element).scrollTop = v;
		}
	};

	if (from === to) return;
	// 含 NaN、负数
	if (!(duration > 0)) {
		write(to);
		return;
	}

	let frame: number | undefined;
	let onResolve: () => void;
	const target = new Promise<void>((resolve) => {
		onResolve = resolve;
	});
	const stop = () => {
		frame !== undefined && window.cancelAnimationFrame(frame);
		signal?.removeEventListener('abort', stop);
		runningOnAxis.get(el) === stop && runningOnAxis.delete(el);
		onResolve();
	};

	// 不使用 rAF 回调的入参：旧实现/polyfill 传入的时间戳与 performance.now() 不同源
	const startTime = performance.now();
	const scroll = () => {
		const elapsed = performance.now() - startTime;
		if (elapsed < duration) {
			write(from + (to - from) * elapsed / duration);
			frame = window.requestAnimationFrame(scroll);
		} else {
			write(to);
			stop();
		}
	};

	runningOnAxis.set(el, stop);
	signal?.addEventListener('abort', stop);
	frame = window.requestAnimationFrame(scroll);

	return target;
};
