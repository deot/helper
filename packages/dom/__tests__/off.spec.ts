import * as $ from '@deot/helper-dom';

describe('off.ts', () => {
	let el = document.createElement('div');
	it('empty', () => {
		expect($.off(el, 'empty', () => {})).toBe(undefined);
	});

	it('off', () => {
		expect.assertions(0);
		const off = $.on(el, 'click', (e) => {
			expect(e.type).toBe('click');
		});

		off();

		el.dispatchEvent(new Event('click'));
	});
});