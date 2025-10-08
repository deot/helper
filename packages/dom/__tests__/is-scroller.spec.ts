import * as $ from '@deot/helper-dom';

describe('is-scroller.ts', () => {
	const el = document.createElement('div');
	const child = document.createElement('div');
	el.style.overflow = 'scroll';
	child.innerHTML = '<p>xxxx</p>';

	el.appendChild(child);
	document.body.appendChild(el);

	it('basic', () => {
		expect($.isScroller(el)).toBe(true);
		expect($.isScroller(el, { direction: 'x' })).toBe(true);
		expect($.isScroller(el, { direction: 'y' })).toBe(true);
		expect($.isScroller(child)).toBe(false);
	});
});
