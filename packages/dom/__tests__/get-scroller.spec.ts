import * as $ from '@deot/helper-dom';

describe('get-scroller.ts', () => {
	const p1 = document.createElement('p');
	const p2 = document.createElement('p');

	const el = document.createElement('div');
	const child = document.createElement('div');
	const fakeScrollerChild = document.createElement('div');
	p2.classList.add('fake-scroller');
	p2.appendChild(fakeScrollerChild);

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

	it('className regex matching', () => {
		expect($.getScroller(fakeScrollerChild, { className: /fake-scroller/ })).toBe(p2);
	});
});
