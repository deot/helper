import * as $ from '@deot/helper-dom';

describe('scroll-into-view.ts', () => {
	const el = document.createElement('div');
	const child = document.createElement('div');
	el.style.overflow = 'scroll';
	child.innerHTML = '<p>xxxx</p>';

	el.appendChild(child);
	document.body.appendChild(el);

	window.scrollTo = () => {};
	window.requestAnimationFrame = (fn: Function) => fn();
	it('basic', async () => {
		$.scrollIntoView(child);
		await $.scrollIntoView(
			child,
			{
				from: 0,
				to: 100
			}
		);

		await $.scrollIntoView(
			window,
			{
				from: 0,
				to: 100
			}
		);

		await $.scrollIntoView(
			window,
			{
				from: 100,
				to: 0
			}
		);
	});

	describe('cancel', () => {
		const raf = window.requestAnimationFrame;
		const caf = window.cancelAnimationFrame;
		let frames: Map<number, FrameRequestCallback>;
		let uid: number;

		// 手动推进帧，只执行当前已注册的回调
		const flush = () => {
			const callbacks = [...frames.values()];
			frames.clear();
			callbacks.forEach(fn => fn(0));
		};
		const flushAll = () => {
			while (frames.size) flush();
		};

		// 记录每次写入的 scrollTop
		const createScroller = () => {
			const writes: number[] = [];
			const scroller = {
				set scrollTop(v: number) {
					writes.push(v);
				}
			} as unknown as HTMLElement;
			return { scroller, writes };
		};

		beforeEach(() => {
			frames = new Map();
			uid = 0;
			window.requestAnimationFrame = (fn: FrameRequestCallback) => {
				frames.set(++uid, fn);
				return uid;
			};
			window.cancelAnimationFrame = (id: number) => {
				frames.delete(id);
			};
		});

		afterEach(() => {
			window.requestAnimationFrame = raf;
			window.cancelAnimationFrame = caf;
		});

		it('new call cancels the previous one on the same element', async () => {
			const { scroller, writes } = createScroller();
			const first = $.scrollIntoView(scroller, { from: 0, to: 600 });
			flush();

			const second = $.scrollIntoView(scroller, { from: 200, to: 0 });
			await first;
			expect(frames.size).toBe(1);

			flushAll();
			await second;
			expect(writes).toEqual([100, 200, 166, 132, 98, 64, 30, 0]);
		});

		it('does not cancel animations on other elements', async () => {
			const a = createScroller();
			const b = createScroller();
			const tasks = [
				$.scrollIntoView(a.scroller, { from: 0, to: 600 }),
				$.scrollIntoView(b.scroller, { from: 0, to: 600 })
			];

			flushAll();
			await Promise.all(tasks);
			expect(a.writes).toEqual([100, 200, 300, 400, 500, 600]);
			expect(b.writes).toEqual([100, 200, 300, 400, 500, 600]);
		});

		it('signal', async () => {
			const { scroller, writes } = createScroller();
			const controller = new AbortController();
			const task = $.scrollIntoView(scroller, { from: 0, to: 600, signal: controller.signal });
			flush();

			controller.abort();
			await task;
			expect(frames.size).toBe(0);
			expect(writes).toEqual([100, 200]);
		});

		it('signal aborted before start', async () => {
			const { scroller, writes } = createScroller();
			const controller = new AbortController();
			controller.abort();

			await $.scrollIntoView(scroller, { from: 0, to: 600, signal: controller.signal });
			expect(frames.size).toBe(0);
			expect(writes).toEqual([]);
		});
	});
});
