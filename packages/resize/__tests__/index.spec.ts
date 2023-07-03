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

	let el = document.createElement('div');

	el.style.width = '100px';
	el.style.height = '100px';
	el.innerHTML = 'any';

	document.body.appendChild(el);

	it('on', async () => {
		expect.assertions(1);
		let handler = () => {
			// any
		};
		Resize.on(el, handler);
		let off = Resize.of(el).on(() => {
			expect(1).toBe(1);
		});

		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);

		Resize.off(el, handler);
		off();

		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);
	});
});