import * as $ from '@deot/helper-dom';

describe('get-scroller.ts', () => {
	let p1 = document.createElement('p');
	let p2 = document.createElement('p');

	let el = document.createElement('div');
	let child = document.createElement('div');
	el.style.overflow = 'scroll';
	child.innerHTML = '<p>xxxx</p>';

	el.appendChild(child);
	document.body.appendChild(el);
	document.body.appendChild(p2);

	it('basic', () => {
		expect($.getScroller(child)).toBe(el);
		expect($.getScroller(el)).toBe(el);
		expect($.getScroller(p1)).toBe(null);
		expect($.getScroller()).toBe(null);
		expect($.getScroller(p2)).toBe(window);
	});
});