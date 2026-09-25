import { Utils } from '@deot/dev-test';
import { Resize } from '@deot/helper-resize';
import ResizeObserver from 'resize-observer-polyfill';

describe('resize.ts', () => {
	Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserver });

	// resize-observer-polyfill fake
	Object.defineProperties(HTMLElement.prototype, {
		clientWidth: {
			get() { return parseFloat(this.style.width) || 0; }
		},
		clientHeight: {
			get() { return parseFloat(this.style.height) || 0; }
		}
	});

	const el = document.createElement('div');

	el.style.width = '100px';
	el.style.height = '100px';
	el.innerHTML = 'any';

	document.body.appendChild(el);

	it('on', async () => {
		expect.assertions(1);
		const handler = () => {
			// any
		};
		Resize.on(el, handler);
		const off = Resize.of(el).on(() => {
			expect(1).toBe(1);
		});

		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);

		Resize.off(el, handler);
		off();
		Resize.off(el);

		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);
	});

	it('off ignores unregistered listeners', async () => {
		const target = document.createElement('div');
		target.style.width = '100px';
		target.style.height = '100px';
		document.body.appendChild(target);

		const a = vi.fn();
		const b = vi.fn();
		const offA = Resize.on(target, a);
		Resize.on(target, b);

		// 同一元素的实例共享listeners：移除未注册的监听器、重复调用取消函数，都不能误删其他调用方的监听器
		Resize.off(target, () => {});
		offA();
		offA();

		target.style.width = '200px';
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);
		Resize.off(target);
		target.remove();

		expect(b).toHaveBeenCalled();
	});
});
