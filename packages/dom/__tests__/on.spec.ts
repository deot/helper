import * as $ from '@deot/helper-dom';

describe('on.ts', () => {
	const el = document.createElement('div');
	it('empty', () => {
		expect(typeof $.on(el, 'empty', () => {})).toBe('function');
	});

	it('on', () => {
		expect.assertions(3);
		const off = $.on(el, 'click', (e: any) => {
			expect(e.type).toBe('click');
		});

		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		off();

		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
	});

	it('window / document / EventTarget', () => {
		const targets: EventTarget[] = [window, document, new EventTarget()];
		targets.forEach((target) => {
			let count = 0;
			const off = $.on(target, 'custom', () => count++);
			target.dispatchEvent(new Event('custom'));
			off();
			target.dispatchEvent(new Event('custom'));

			$.once(target, 'custom', () => count++);
			target.dispatchEvent(new Event('custom'));
			target.dispatchEvent(new Event('custom'));

			const handler = () => count++;
			$.on(target, 'custom', handler);
			$.off(target, 'custom', handler);
			target.dispatchEvent(new Event('custom'));

			expect(count).toBe(2);
		});
	});
});
