import * as $ from '@deot/helper-dom';

describe('el.ts', () => {
	const el = document.createElement('div');
	el.innerHTML = '<span></span>';
	document.body.appendChild(el);

	it('basic', () => {
		expect($.el('div')).toBe(el);
		expect($.el(el)).toBe(el);
	});

	it('catch', () => {
		expect.assertions(1);
		try {
			$.el('button');
		} catch (e: any) {
			expect(e.message).toMatch(`el缺失`);
		}
	});
});
