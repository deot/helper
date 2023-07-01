import * as $ from '@deot/helper-dom';

describe('add-class.ts', () => {
	let el = document.createElement('div');
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
});