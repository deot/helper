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

	it('document fragment', () => {
		const fragment = document.createDocumentFragment();
		const node = document.createElement('div');
		fragment.appendChild(node);

		expect($.getScroller(node)).toBe(null);
	});

	it('shadow dom', () => {
		const scroller = document.createElement('div');
		const host = document.createElement('div');
		const inner = document.createElement('div');
		scroller.style.overflow = 'auto';
		scroller.appendChild(host);
		document.body.appendChild(scroller);
		host.attachShadow({ mode: 'open' }).appendChild(inner);

		// 穿过 ShadowRoot 找到宿主外层的滚动容器
		expect($.getScroller(inner)).toBe(scroller);

		// 没有滚动容器时一路到 window
		const host2 = document.createElement('div');
		const inner2 = document.createElement('div');
		document.body.appendChild(host2);
		host2.attachShadow({ mode: 'open' }).appendChild(inner2);
		expect($.getScroller(inner2)).toBe(window);
	});

	it('slotted node finds the scroller inside the shadow tree', () => {
		const host = document.createElement('div');
		const slotted = document.createElement('span');
		host.appendChild(slotted);
		document.body.appendChild(host);

		const root = host.attachShadow({ mode: 'open' });
		root.innerHTML = '<div style="overflow: auto"><slot></slot></div>';

		expect($.getScroller(slotted)).toBe(root.firstElementChild);
	});
});
