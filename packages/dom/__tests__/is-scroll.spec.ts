import * as $ from '@deot/helper-dom';

describe('is-scroll.ts', () => {
	const el = document.createElement('div');
	const child = document.createElement('div');
	el.style.overflow = 'scroll';
	child.innerHTML = '<p>xxxx</p>';

	el.appendChild(child);
	document.body.appendChild(el);

	it('basic', () => {
		expect($.isScroll(el)).toBe(true);
		expect($.isScroll(el, 'x')).toBe(true);
		expect($.isScroll(el, 'y')).toBe(true);
		expect($.isScroll(child)).toBe(false);
	});
});
