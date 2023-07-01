import * as $ from '@deot/helper-dom';

describe('on.ts', () => {
	let el = document.createElement('div');
	it('empty', () => {
		expect(typeof $.on(el, 'empty', () => {})).toBe('function');
	});

	it('on', () => {
		expect.assertions(3);
		const off = $.on(el, 'click', (e) => {
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
});