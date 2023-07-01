import * as $ from '@deot/helper-dom';

describe('remove-class.ts', () => {
	let el = document.createElement('div');
	it('empty', () => {
		expect($.removeClass(el)).toBe(undefined);
	});

	it('remove', () => {
		$.addClass(el, ' small bold ');

		expect(el.className).toMatch('small bold');

		$.removeClass(el, 'small');
		expect($.hasClass(el, 'small')).toBe(false);

		// 将classList置空，使用设置className
		Object.defineProperty(el, 'classList', { value: null });

		$.removeClass(el, 'bold');
		expect($.hasClass(el, 'bold')).toBe(false);

		$.addClass(el, 'small bold');
		expect($.hasClass(el, 'small')).toBe(true);
		expect($.hasClass(el, 'bold')).toBe(true);

		$.removeClass(el, ' small bold ');
		expect($.hasClass(el, 'small')).toBe(false);
		expect($.hasClass(el, 'bold')).toBe(false);
	});
});