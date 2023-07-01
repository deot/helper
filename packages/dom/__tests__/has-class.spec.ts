import * as $ from '@deot/helper-dom';

describe('has-class.ts', () => {
	let el = document.createElement('div');
	it('empty', () => {
		expect($.hasClass(el)).toBe(false);
	});

	it('has', () => {
		$.addClass(el, ' small bold ');

		expect($.hasClass(el, 'small')).toBe(true);
		expect($.hasClass(el, 'small1')).toBe(false);

		// 将classList置空，使用设置className
		Object.defineProperty(el, 'classList', { value: null });

		expect($.hasClass(el, 'small')).toBe(true);
		expect($.hasClass(el, 'small1')).toBe(false);
	});

	it('catch', () => {
		expect.assertions(1);
		try {
			$.hasClass(el, ' xxx ');
		} catch (e: any) {
			expect(e.message).toMatch(`类名不应该包含空格`);
		}
	});
});