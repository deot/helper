import { Utils } from '@deot/dev-test';
import { Wheel } from '@deot/helper-wheel';

describe('wheel.ts', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	// 等到下一帧：此前申请的动画帧回调都已执行
	const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

	// 接管Date.now，返回设置当前时间的函数
	const mockNow = (value: number) => {
		let now = value;
		vi.spyOn(Date, 'now').mockImplementation(() => now);
		return (next: number) => {
			now = next;
		};
	};

	const make = (mode: string): HTMLElement => {
		const el = document.createElement('div');

		el.style.margin = '25px 0';
		el.style.width = 'calc(100vw - 100px)';
		el.style.height = 'calc(50vh - 50px)';
		el.style.background = '#f2f2f2';
		el.style.overflow = mode !== 'original' ? 'hidden' : 'auto';

		Array.from({
			length: 30
		}).forEach((_: any, index: number) => {
			const child = document.createElement('div');
			child.style.width = '300vw';
			child.innerHTML = `<span style="color: red">${index}</span>` + (` .${mode}. `).repeat(25);

			el.appendChild(child);
		});

		document.body.appendChild(el);

		Object.defineProperty(el, 'clientWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollWidth', { value: 10000, writable: true });

		Object.defineProperty(el, 'clientHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 10000, writable: true });

		Object.defineProperty(el, 'scrollTop', { value: 1 });
		Object.defineProperty(el, 'scrollLeft', { value: 1 });
		return el;
	};

	const dispatchWheel = (el: HTMLElement, deltaX: number, deltaY: number, deltaMode?: number, ctrlKey?: boolean) => {
		const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey });
		Object.defineProperty(e, 'deltaX', { value: deltaX });
		Object.defineProperty(e, 'deltaY', { value: deltaY });
		deltaMode && Object.defineProperty(e, 'deltaMode', { value: deltaMode });

		el.dispatchEvent(e);
		return e;
	};

	// fingers：屏幕上的触点数
	const dispatchTouch = (el: HTMLElement, type: string, screenX: number, screenY: number, fingers = 1) => {
		const e = new TouchEvent(type);
		Object.defineProperty(e, 'touches', { value: Array.from({ length: fingers }, () => ({})) });
		Object.defineProperty(e.touches[0], 'screenX', { value: -screenX });
		Object.defineProperty(e.touches[0], 'screenY', { value: -screenY });

		Object.defineProperty(e, 'changedTouches', { value: [] });
		Object.defineProperty(e.changedTouches, '0', { value: {} });
		Object.defineProperty(e.changedTouches[0], 'screenX', { value: -screenX });
		Object.defineProperty(e.changedTouches[0], 'screenY', { value: -screenY });

		el.dispatchEvent(e);
	};

	// buttons：按下的键，4为中键
	const dispatchMouse = (el: HTMLElement, deltaX: number, deltaY: number, buttons = 4) => {
		const e = new MouseEvent('mousemove', { buttons });
		Object.defineProperty(e, 'movementX', { value: deltaX });
		Object.defineProperty(e, 'movementY', { value: deltaY });

		el.dispatchEvent(e);
	};

	it('none options', async () => {
		const el = make('wheel');
		const wheel = Wheel.of(el, {
			shouldWheelX: () => true,
			shouldWheelY: () => true,
			stopPropagation: () => true
		});
		const handler = () => {};

		wheel.on(handler);
		wheel.on(handler);
		dispatchWheel(el, 0, 10);
		await Utils.sleep(20);
		wheel.off(handler);
		wheel.off();
	});

	it('y', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(
			el
		);

		const handler = (x: number, y: number) => {
			expect(x).toBe(0);
			expect(y).toBe(10);
		};

		const off = wheel.on(handler);

		dispatchWheel(el, 0, 10);
		await Utils.sleep(20);
		off();
	});

	it('x', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		const handler = (x: number, y: number) => {
			expect(x).toBe(10);
			expect(y).toBe(0);
		};

		const off = wheel.on(handler);

		dispatchWheel(el, 10, 0);
		await Utils.sleep(30);
		off();
	});

	it('off ignores unregistered listeners', async () => {
		const el = make('wheel');
		const wheel = Wheel.of(el);
		const a = vi.fn();
		const b = vi.fn();
		const offA = wheel.on(a);
		wheel.on(b);

		// 移除未注册的监听器、重复调用取消函数，都不能误删其他监听器
		wheel.off(() => {});
		offA();
		offA();

		dispatchWheel(el, 0, 10);
		await Utils.sleep(30);
		wheel.off();

		expect(a).not.toHaveBeenCalled();
		expect(b).toHaveBeenCalledWith(0, 10);
	});

	// deltaMode = 1（行）按40px换算
	it('deltaMode: line', async () => {
		const el = make('wheel');
		const handler = vi.fn();

		const off = Wheel.of(el).on(handler);

		dispatchWheel(el, 0, 1, 1);
		await Utils.sleep(30);
		off();

		expect(handler).toHaveBeenCalledWith(0, 40);
	});

	// deltaMode = 2（页）按800px换算
	it('deltaMode: page', async () => {
		const el = make('wheel');
		const handler = vi.fn();

		const off = Wheel.of(el).on(handler);

		dispatchWheel(el, 0, 1, 2);
		await Utils.sleep(30);
		off();

		expect(handler).toHaveBeenCalledWith(0, 800);
	});

	it('shouldWheel: false', async () => {
		expect.assertions(0);
		const el = make('wheel');
		const wheel = Wheel.of(el, {
			freedom: true,
			shouldWheelX: () => false,
			shouldWheelY: () => false
		});

		const handler = (x: number, y: number) => {
			expect(x).toBe(10);
			expect(y).toBe(0);
		};

		const off = wheel.on(handler);

		dispatchWheel(el, 10, 0);
		await Utils.sleep(30);
		off();
	});

	it('touch x', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		const handler = (x: number, y: number) => {
			expect(x).toBe(10);
			expect(y).toBe(0);
		};

		const off = wheel.on(handler);

		dispatchTouch(el, 'touchmove', 100, 0); // 无效

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', 10, 0);
		dispatchTouch(el, 'touchend', 10, 0);
		await Utils.sleep(30);
		off();
	});

	it('touch -x', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		const handler = (x: number, y: number) => {
			expect(x).toBe(-10);
			expect(y).toBe(0);
		};

		const off = wheel.on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', -10, 0);
		dispatchTouch(el, 'touchend', -10, 0);
		await Utils.sleep(30);
		off();
	});

	it('touch y', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		const handler = (x: number, y: number) => {
			expect(x).toBe(0);
			expect(y).toBe(10);
		};

		const off = wheel.on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', 0, 10);
		dispatchTouch(el, 'touchend', 0, 10);
		await Utils.sleep(30);
		off();
	});

	it('touch -y', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		const handler = (x: number, y: number) => {
			expect(x).toBe(0);
			expect(y).toBe(-10);
		};

		const off = wheel.on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', 0, -10);
		dispatchTouch(el, 'touchend', 0, -10);
		await Utils.sleep(30);
		off();
	});

	// 松手后按整段手势的平均速度匀速再滑300ms
	it('touch end: keeps moving for 300ms at the average speed', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1100);
		dispatchTouch(el, 'touchmove', 0, 100);
		dispatchTouch(el, 'touchend', 0, 100);

		// 速度 = 100px / 100ms；同一毫秒内的帧不派发
		await frame();
		expect(handler.mock.calls).toEqual([[0, 100]]);

		setNow(1116);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[0, 100], [0, 16]]);

		// 超过300ms的部分不计
		setNow(1500);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[0, 100], [0, 16], [0, 284]]);

		setNow(2000);
		await frame();
		await frame();
		expect(handler).toHaveBeenCalledTimes(3);
		off();
	});

	// 此前每毫秒派发一次速度值，不足0.5px的被取整为0而整段丢弃
	it('touch end: slow flings still have inertia', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1100);
		dispatchTouch(el, 'touchmove', 20, 0);
		dispatchTouch(el, 'touchend', 20, 0);
		await frame();

		setNow(1120);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[20, 0], [4, 0]]);
		off();
	});

	it('touch end: a new touch stops the inertia', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1100);
		dispatchTouch(el, 'touchmove', 0, 100);
		dispatchTouch(el, 'touchend', 0, 100);
		await frame();

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1200);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[0, 100]]);
		off();
	});

	it('touch end: the inertia stops at the edge', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		let scrollable = true;
		const off = Wheel.of(el, {
			shouldWheelX: () => false,
			shouldWheelY: () => scrollable
		}).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1100);
		dispatchTouch(el, 'touchmove', 0, 100);
		dispatchTouch(el, 'touchend', 0, 100);
		await frame();

		// 到边界：停下，之后即使又能滚了也不再继续
		scrollable = false;
		setNow(1116);
		await frame();
		scrollable = true;
		setNow(1200);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[0, 100]]);
		off();
	});

	it('off cancels the pending frame and the inertia', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const wheel = Wheel.of(el);
		const handler = vi.fn();
		wheel.on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1100);
		dispatchTouch(el, 'touchmove', 0, 100);
		dispatchTouch(el, 'touchend', 0, 100);

		// 尚未派发的增量、惯性、未松开的等待一并取消
		wheel.off();
		expect(wheel.animationFrameID).toBe(null);
		expect(wheel.needThresholdWait).toBe(false);
		expect(wheel.deltaY).toBe(0);

		// 重新监听后不会收到解除之前的增量
		wheel.on(handler);
		setNow(1200);
		await frame();
		await frame();
		expect(handler).not.toHaveBeenCalled();
		wheel.off();
	});

	it('decay: slows down from the release speed until it stops', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el, { decay: true }).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1050);
		dispatchTouch(el, 'touchmove', 0, 50);
		dispatchTouch(el, 'touchend', 0, 50);
		await frame();

		// 起步速度 = 50px / 50ms，每帧的移动量递减
		setNow(1066);
		await frame();
		setNow(1082);
		await frame();
		setNow(6000);
		await frame();
		await frame();

		const moves = handler.mock.calls.slice(1).map(i => i[1]);
		expect(handler.mock.calls[0]).toEqual([0, 50]);
		expect(moves).toHaveLength(3);
		expect(moves[0]).toBeLessThan(16);
		expect(moves[1]).toBeLessThan(moves[0]);
		// 总距离 = 起步速度 × 时间常数(325ms)
		expect(moves[0] + moves[1] + moves[2]).toBeCloseTo(325, 2);

		// 已停下
		setNow(7000);
		await frame();
		await frame();
		expect(handler).toHaveBeenCalledTimes(4);
		off();
	});

	it('decay: no inertia when the finger rests before release', async () => {
		const setNow = mockNow(1000);
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el, { decay: true }).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		setNow(1020);
		dispatchTouch(el, 'touchmove', 0, 50);
		// 停住超过采样窗口(100ms)才松手
		setNow(1300);
		dispatchTouch(el, 'touchend', 0, 50);

		await frame();
		setNow(1400);
		await frame();
		await frame();
		expect(handler.mock.calls).toEqual([[0, 50]]);
		off();
	});

	it('multi-touch and touchcancel are not handled', async () => {
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		// 双指（缩放）
		dispatchTouch(el, 'touchstart', 0, 0, 2);
		dispatchTouch(el, 'touchmove', 0, 10, 2);
		dispatchTouch(el, 'touchend', 0, 10);

		// 手势被系统取消
		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchcancel', 0, 0);
		dispatchTouch(el, 'touchmove', 0, 10);

		await frame();
		expect(handler).not.toHaveBeenCalled();
		off();
	});

	it('no scroll', async () => {
		expect.assertions(0);
		const el = make('wheel');
		const wheel = Wheel.of(el);

		Object.defineProperty(el, 'scrollWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 1000 });

		const handler = () => {
			expect(1).toBe(1);
		};

		const off = wheel.on(handler);
		dispatchWheel(el, 10, 0);
		dispatchWheel(el, 0, 10);
		await Utils.sleep(30);
		off();
	});

	it('native', async () => {
		expect.assertions(0);
		const el = make('wheel');
		const wheel = Wheel.of(el, {
			shouldWheelX: () => false,
			shouldWheelY: () => false
		});

		wheel.enable();
		const off = wheel.enable();

		wheel.needThresholdWait = true;
		dispatchWheel(el, 100, 0);
		dispatchWheel(el, 0, 100);
		dispatchWheel(document.body, 0, 100);

		await Utils.sleep(30);
		off();
	});

	// 只拦滚到边界的那一段手势；停手后标记清除，下一段手势直接带动父层
	it('native: holds the parent only within the same gesture', () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		const el = make('wheel');
		let scrollable = true;
		const wheel = Wheel.of(el, {
			shouldWheelX: () => false,
			shouldWheelY: () => scrollable
		});
		const off = wheel.on(() => {});

		// 容器内滚动
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(true);

		// 没停手就滚到了边界：拦住，且持续滚动期间一直拦
		scrollable = false;
		vi.advanceTimersByTime(20);
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(true);
		vi.advanceTimersByTime(20);
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(true);
		expect(wheel.needThresholdWait).toBe(true);

		// 停手后再滚：交给父层
		vi.advanceTimersByTime(30);
		expect(wheel.needThresholdWait).toBe(false);
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(false);

		// 容器内滚动后停手，隔一会儿再到边界：不再先拦一次
		scrollable = true;
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(true);
		vi.advanceTimersByTime(30);
		scrollable = false;
		expect(dispatchWheel(el, 0, 10).defaultPrevented).toBe(false);

		off();
	});

	it('native: listens globally only while a gesture is held', () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		const add = vi.spyOn(document, 'addEventListener');
		const remove = vi.spyOn(document, 'removeEventListener');
		const count = (spy: typeof add | typeof remove) => spy.mock.calls.filter(i => i[0] === 'wheel' || i[0] === 'mousedown').length;
		const options = { shouldWheelX: () => false, shouldWheelY: () => true };
		const a = Wheel.of(make('wheel'), options);
		const b = Wheel.of(make('wheel'), options);
		a.on(() => {});
		b.on(() => {});
		expect(count(add)).toBe(0);

		// 第一个实例进入未松开状态时才监听，之后的实例共用
		dispatchWheel(a.el, 0, 10);
		expect(count(add)).toBe(2);
		vi.advanceTimersByTime(10);
		dispatchWheel(b.el, 0, 10);
		expect(count(add)).toBe(2);

		// 别处继续滚动：都顺延
		vi.advanceTimersByTime(25);
		dispatchWheel(document.body, 0, 10);
		vi.advanceTimersByTime(25);
		expect(a.needThresholdWait).toBe(true);
		expect(b.needThresholdWait).toBe(true);
		expect(count(remove)).toBe(0);

		// 全部松开后移除
		vi.advanceTimersByTime(5);
		expect(a.needThresholdWait).toBe(false);
		expect(b.needThresholdWait).toBe(false);
		expect(count(remove)).toBe(2);

		a.off();
		b.off();
	});

	it('ctrl + wheel (zoom) is not handled', async () => {
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		expect(dispatchWheel(el, 0, 10, 0, true).defaultPrevented).toBe(false);
		await frame();
		expect(handler).not.toHaveBeenCalled();
		off();
	});

	it('calls the remaining listeners after one that throws', async () => {
		const el = make('wheel');
		const wheel = Wheel.of(el);
		const [first, second] = [new Error('first'), new Error('second')];
		const good = vi.fn();
		wheel.on(() => {
			throw first;
		});
		wheel.on(good);
		wheel.on(() => {
			throw second;
		});

		// 派发期间记下定时器回调，不真正执行
		const timers: (() => void)[] = [];
		vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: any) => timers.push(fn)) as any);
		wheel.deltaY = 10;
		wheel.animationFrameID = 1;
		let thrown: unknown;
		try {
			wheel.didWheel();
		} catch (e) {
			thrown = e;
		}

		// 后面的监听函数照常执行；第一个错误原样抛出，其余的各自经定时器抛出
		expect(thrown).toBe(first);
		expect(good).toHaveBeenCalledWith(0, 10);
		expect(timers).toHaveLength(1);
		expect(timers[0]).toThrow(second);

		// 状态已复位：此前animationFrameID残留，之后不再申请动画帧，实例失效
		expect(wheel.animationFrameID).toBe(null);
		expect(wheel.deltaY).toBe(0);
		vi.restoreAllMocks();
		wheel.listeners = [good];
		dispatchWheel(el, 0, 20);
		await frame();
		expect(good).toHaveBeenLastCalledWith(0, 20);
		wheel.off();
	});

	it('off inside a listener does not skip the next one', () => {
		const wheel = Wheel.of(make('wheel'));
		const calls: string[] = [];
		const a = () => {
			calls.push('a');
			wheel.off(a);
			wheel.off(c);
		};
		const b = () => calls.push('b');
		const c = () => calls.push('c');
		wheel.on(a);
		wheel.on(b);
		wheel.on(c);

		// 本轮已被off的c不再执行，b不被跳过
		wheel.didWheel();
		expect(calls).toEqual(['a', 'b']);
		wheel.didWheel();
		expect(calls).toEqual(['a', 'b', 'b']);
		wheel.off();
	});

	it('registers the same listener only once', async () => {
		const el = make('wheel');
		const wheel = Wheel.of(el);
		const handler = vi.fn();
		wheel.on(handler);
		wheel.on(handler);

		dispatchWheel(el, 0, 10);
		await frame();
		expect(handler).toHaveBeenCalledTimes(1);

		wheel.off(handler);
		expect(wheel.listeners).toHaveLength(0);
		// 已全部解除时再off无副作用
		wheel.off();
	});

	// offsetHeight含边框，按它算最大滚动距离会偏小，末尾的边框宽度滚不到
	it('shouldWheel ignores borders', () => {
		const el = document.createElement('div');
		const size = (scrollTop: number, scrollLeft: number) => {
			Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true });
			Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true });
		};

		Object.defineProperty(el, 'offsetWidth', { value: 102 });
		Object.defineProperty(el, 'offsetHeight', { value: 102 });
		Object.defineProperty(el, 'clientWidth', { value: 100 });
		Object.defineProperty(el, 'clientHeight', { value: 100 });
		Object.defineProperty(el, 'scrollWidth', { value: 300 });
		Object.defineProperty(el, 'scrollHeight', { value: 300 });

		// 距末尾还有2px
		size(198, 198);
		expect(Wheel.shouldWheelX(el, 10)).toBe(true);
		expect(Wheel.shouldWheelY(el, 10)).toBe(true);

		size(200, 200);
		expect(Wheel.shouldWheelX(el, 10)).toBe(false);
		expect(Wheel.shouldWheelY(el, 10)).toBe(false);
	});

	// touch: false时不模拟触摸，中键拖动照常
	it('touch: false skips touch simulation', async () => {
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el, {
			touch: false,
			shouldWheelX: () => true,
			shouldWheelY: () => true
		}).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', 10, 0);
		dispatchTouch(el, 'touchend', 10, 0);
		await Utils.sleep(30);
		expect(handler).not.toHaveBeenCalled();

		// 中键拖动
		dispatchMouse(el, 100, 0);
		await Utils.sleep(30);
		off();

		expect(handler).toHaveBeenCalledWith(100, 0);
	});

	// 中键拖动与触摸并存；其它键拖动不处理
	it('mousemove', async () => {
		expect.assertions(2);
		const el = make('wheel');
		const wheel = Wheel.of(el, {
			shouldWheelX: () => true,
			shouldWheelY: () => true
		});

		const handler = (x: number, y: number) => {
			expect(x).toBe(100);
			expect(y).toBe(0);
		};

		const off = wheel.on(handler);

		dispatchMouse(el, 100, 0);
		dispatchMouse(el, 1000, 0, 1);
		await Utils.sleep(30);
		off();
	});

	it('shouldWheelX at right edge uses scrollLeft not scrollTop', () => {
		const el = document.createElement('div');
		const maxScrollLeft = 9000;

		Object.defineProperty(el, 'clientWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollWidth', { value: 10000 });
		Object.defineProperty(el, 'clientHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollTop', { value: 0 });
		Object.defineProperty(el, 'scrollLeft', { value: maxScrollLeft });

		// At right edge: further right scroll must be disallowed.
		expect(Wheel.shouldWheelX(el, 100)).toBe(false);
		// Must still allow scrolling back left.
		expect(Wheel.shouldWheelX(el, -100)).toBe(true);
	});

	it('scroll left after reaching right edge', async () => {
		const el = document.createElement('div');
		let scrollLeft = 9000;
		const maxScrollLeft = 9000;

		Object.defineProperty(el, 'clientWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollWidth', { value: 10000 });
		Object.defineProperty(el, 'clientHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });
		Object.defineProperty(el, 'scrollLeft', {
			get: () => scrollLeft,
			set: (v: number) => {
				scrollLeft = v;
			}
		});

		document.body.appendChild(el);

		const off = Wheel.of(el).enable();

		// Hit right boundary: shouldWheelX returns false for further right scroll.
		dispatchWheel(el, 100, 0);
		await Utils.sleep(30);
		expect(scrollLeft).toBe(maxScrollLeft);

		// User must be able to scroll back left from the right edge.
		dispatchWheel(el, -100, 0);
		await Utils.sleep(30);
		expect(scrollLeft).toBeLessThan(maxScrollLeft);

		off();
	});

	it('scroll left at right edge when opposing wheel events share one rAF', async () => {
		const el = document.createElement('div');
		let scrollLeft = 9000;
		const maxScrollLeft = 9000;

		Object.defineProperty(el, 'clientWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollWidth', { value: 10000 });
		Object.defineProperty(el, 'clientHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });
		Object.defineProperty(el, 'scrollLeft', {
			get: () => scrollLeft,
			set: (v: number) => {
				scrollLeft = v;
			}
		});

		document.body.appendChild(el);

		const off = Wheel.of(el).enable();

		// At right edge: rightward delta is rejected, leftward delta in the same frame must still apply.
		dispatchWheel(el, 100, 0);
		dispatchWheel(el, -100, 0);
		await Utils.sleep(30);

		expect(scrollLeft).toBeLessThan(maxScrollLeft);

		off();
	});

	// 放在最后：该用例会把document.ontouchend改为undefined
	it('no touch support', async () => {
		Object.defineProperty(document, 'ontouchend', { value: undefined });
		const el = make('wheel');
		const handler = vi.fn();
		const off = Wheel.of(el).on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		dispatchTouch(el, 'touchmove', 10, 0);
		dispatchTouch(el, 'touchend', 10, 0);
		await frame();
		expect(handler).not.toHaveBeenCalled();
		off();
	});
});
