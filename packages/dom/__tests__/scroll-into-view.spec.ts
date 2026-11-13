import * as $ from '@deot/helper-dom';

describe('scroll-into-view.ts', () => {
	const raf = window.requestAnimationFrame;
	const caf = window.cancelAnimationFrame;
	let frames: Map<number, FrameRequestCallback>;
	let uid: number;
	let now: number;

	// 手动推进一帧：时钟前进 ms，只执行当前已注册的回调
	const flush = (ms = 50) => {
		now += ms;
		const callbacks = [...frames.values()];
		frames.clear();
		callbacks.forEach(fn => fn(now));
	};
	const flushAll = (ms = 50) => {
		while (frames.size) flush(ms);
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
		now = 1000;
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		window.requestAnimationFrame = (fn: FrameRequestCallback) => {
			frames.set(++uid, fn);
			return uid;
		};
		window.cancelAnimationFrame = (id: number) => {
			frames.delete(id);
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
		window.requestAnimationFrame = raf;
		window.cancelAnimationFrame = caf;
	});

	it('basic', async () => {
		const el = document.createElement('div');
		const child = document.createElement('div');
		el.style.overflow = 'scroll';
		child.innerHTML = '<p>xxxx</p>';
		el.appendChild(child);
		document.body.appendChild(el);

		// from 与 to 相同，不需要动画
		await $.scrollIntoView(el);
		expect(frames.size).toBe(0);

		const task = $.scrollIntoView(el, { from: 0, to: 100 });
		flushAll();
		await task;
		expect(el.scrollTop).toBe(100);
	});

	it('window', async () => {
		const scrollTo = window.scrollTo;
		const calls: number[][] = [];
		window.scrollTo = ((x: number, y: number) => calls.push([x, y])) as unknown as typeof window.scrollTo;

		let task = $.scrollIntoView(window, { from: 0, to: 100, duration: 100 });
		flushAll();
		await task;

		task = $.scrollIntoView(window, { from: 100, to: 0, duration: 100 });
		flushAll();
		await task;
		window.scrollTo = scrollTo;

		expect(calls).toEqual([
			[window.scrollX, 50],
			[window.scrollX, 100],
			[window.scrollX, 50],
			[window.scrollX, 0]
		]);
	});

	it('duration is honored regardless of frame rate', async () => {
		// 不同帧间隔下都应在 300ms 时到达终点
		for (const interval of [20, 10, 5]) {
			const { scroller, writes } = createScroller();
			const start = now;
			const task = $.scrollIntoView(scroller, { from: 0, to: 600, duration: 300 });
			flushAll(interval);
			await task;

			expect(now - start).toBe(300);
			expect(writes.length).toBe(300 / interval);
			expect(writes[writes.length - 1]).toBe(600);
			// 线性且单调
			expect(writes.every((v, i) => i === 0 || v > writes[i - 1])).toBe(true);
		}
	});

	it('a dropped frame does not overshoot', async () => {
		const { scroller, writes } = createScroller();
		const task = $.scrollIntoView(scroller, { from: 0, to: 600, duration: 300 });
		flush(100);
		flush(1000);
		await task;
		expect(writes).toEqual([200, 600]);
	});

	it('non-positive duration jumps to the end', async () => {
		for (const duration of [0, -100, NaN]) {
			const { scroller, writes } = createScroller();
			await $.scrollIntoView(scroller, { from: 0, to: 600, duration });
			expect(frames.size).toBe(0);
			expect(writes).toEqual([600]);
		}
	});

	it('new call cancels the previous one on the same element', async () => {
		const { scroller, writes } = createScroller();
		const first = $.scrollIntoView(scroller, { from: 0, to: 600 });
		flush();
		flush();

		const second = $.scrollIntoView(scroller, { from: 300, to: 0 });
		await first;
		expect(frames.size).toBe(1);

		flushAll();
		await second;
		expect(writes).toEqual([100, 200, 250, 200, 150, 100, 50, 0]);
	});

	it('a no-op call still cancels the previous one', async () => {
		const { scroller, writes } = createScroller();
		const first = $.scrollIntoView(scroller, { from: 0, to: 600 });
		flush();

		await $.scrollIntoView(scroller, { from: 100, to: 100 });
		await first;
		expect(frames.size).toBe(0);
		expect(writes).toEqual([100]);
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
		flush();

		controller.abort();
		await task;
		expect(frames.size).toBe(0);
		expect(writes).toEqual([100, 200]);
	});

	it('axis x writes scrollLeft', async () => {
		const writes = { x: [] as number[], y: [] as number[] };
		const scroller = {
			set scrollLeft(v: number) {
				writes.x.push(v);
			},
			set scrollTop(v: number) {
				writes.y.push(v);
			}
		} as unknown as HTMLElement;

		const task = $.scrollIntoView(scroller, { from: 0, to: 600, axis: 'x' });
		flushAll();
		await task;
		expect(writes).toEqual({ x: [100, 200, 300, 400, 500, 600], y: [] });
	});

	it('x and y animations on the same element do not cancel each other', async () => {
		const writes = { x: [] as number[], y: [] as number[] };
		const scroller = {
			set scrollLeft(v: number) {
				writes.x.push(v);
			},
			set scrollTop(v: number) {
				writes.y.push(v);
			}
		} as unknown as HTMLElement;

		const tasks = [
			$.scrollIntoView(scroller, { from: 0, to: 600, axis: 'x' }),
			$.scrollIntoView(scroller, { from: 0, to: 600 })
		];
		flushAll();
		await Promise.all(tasks);
		expect(writes).toEqual({
			x: [100, 200, 300, 400, 500, 600],
			y: [100, 200, 300, 400, 500, 600]
		});
	});

	it('window keeps the other axis', async () => {
		const scrollTo = window.scrollTo;
		const calls: number[][] = [];
		window.scrollTo = ((x: number, y: number) => calls.push([x, y])) as unknown as typeof window.scrollTo;

		const tasks = [
			$.scrollIntoView(window, { from: 0, to: 100, duration: 50, axis: 'x' }),
			$.scrollIntoView(window, { from: 0, to: 100, duration: 50 })
		];
		flushAll();
		await Promise.all(tasks);
		window.scrollTo = scrollTo;
		expect(calls).toEqual([
			[100, window.scrollY],
			[window.scrollX, 100]
		]);
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
