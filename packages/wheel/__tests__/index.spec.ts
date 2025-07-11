import { Utils } from '@deot/dev-test';
import normalizeWheel from 'normalize-wheel';
import { Wheel } from '@deot/helper-wheel';

describe('wheel.ts', () => {
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

		Object.defineProperty(el, 'offsetWidth', { value: 1000 });
		Object.defineProperty(el, 'scrollWidth', { value: 10000, writable: true });

		Object.defineProperty(el, 'offsetHeight', { value: 1000 });
		Object.defineProperty(el, 'scrollHeight', { value: 10000, writable: true });

		Object.defineProperty(el, 'scrollTop', { value: 1 });
		Object.defineProperty(el, 'scrollLeft', { value: 1 });
		return el;
	};

	const dispatchWheel = (el: HTMLElement, deltaX: number, deltaY: number) => {
		const e = new WheelEvent(normalizeWheel.getEventType());
		Object.defineProperty(e, 'deltaX', { value: deltaX });
		Object.defineProperty(e, 'deltaY', { value: deltaY });
		Object.defineProperty(e, 'cancelable', { value: true });

		el.dispatchEvent(e);
	};

	const dispatchTouch = (el: HTMLElement, type: string, screenX: number, screenY: number) => {
		const e = new TouchEvent(type);
		Object.defineProperty(e, 'touches', { value: [] });
		Object.defineProperty(e.touches, '0', { value: {} });
		Object.defineProperty(e.touches[0], 'screenX', { value: -screenX });
		Object.defineProperty(e.touches[0], 'screenY', { value: -screenY });

		Object.defineProperty(e, 'changedTouches', { value: [] });
		Object.defineProperty(e.changedTouches, '0', { value: {} });
		Object.defineProperty(e.changedTouches[0], 'screenX', { value: -screenX });
		Object.defineProperty(e.changedTouches[0], 'screenY', { value: -screenY });

		el.dispatchEvent(e);
	};

	const dispatchMouse = (el: HTMLElement, deltaX: number, deltaY: number, which?: number) => {
		const e = new MouseEvent('mousemove');
		Object.defineProperty(e, 'which', { value: which || 2 });
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

	// 滑动延迟，跟随移动
	it('touch end', async () => {
		const el = make('wheel');
		const wheel = Wheel.of(el);

		let count = 0;
		const handler = () => {
			count++;
		};

		const off = wheel.on(handler);

		dispatchTouch(el, 'touchstart', 0, 0);
		await Utils.sleep(100);
		dispatchTouch(el, 'touchmove', 0, 10);
		dispatchTouch(el, 'touchend', 0, 500);
		await Utils.sleep(500);
		off();

		expect(count).toBeGreaterThan(15);
		expect(count).toBeLessThan(20);
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

	it('mousemove', async () => {
		expect.assertions(2);
		Object.defineProperty(document, 'ontouchend', { value: undefined });
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
});
