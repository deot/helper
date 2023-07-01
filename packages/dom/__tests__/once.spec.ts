import * as $ from '@deot/helper-dom';

describe('once.ts', () => {
	let el = document.createElement('div');
	it('empty', () => {
		expect(typeof $.once(el, 'empty', () => {})).toBe('function');
	});

	it('once', () => {
		expect.assertions(1);
		const off = $.once(el, 'click', (e) => {
			expect(e.type).toBe('click');
		});

		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		el.dispatchEvent(new Event('click'));
		off();
	});
});