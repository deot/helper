import * as $ from '@deot/helper-dom';

describe('add-class.ts', () => {
	const el = document.createElement('div');
	it('empty', () => {
		expect($.addClass(el)).toBe(undefined);
	});

	it('add', () => {
		$.addClass(el, ' small bold ');

		expect(el.className).toMatch('small bold');
		// 已经存在
		$.addClass(el, 'bold');

		// 将classList置空，使用设置className
		Object.defineProperty(el, 'classList', { value: null });

		$.addClass(el, 'yellow');
		$.addClass(el, 'yellow');

		expect(el.className).toMatch('small bold yellow');
	});

	it('any whitespace separates class names', () => {
		const target = document.createElement('div');
		$.addClass(target, 'a\tb\n  c');
		expect(target.className).toBe('a b c');

		$.removeClass(target, '\na\tc ');
		expect(target.className).toBe('b');
	});

	it('svg', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		$.addClass(svg, 'icon large');
		expect($.hasClass(svg, 'icon')).toBe(true);

		$.removeClass(svg, 'icon');
		expect(svg.getAttribute('class')).toBe('large');
	});
});
