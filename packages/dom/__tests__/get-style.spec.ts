import * as $ from '@deot/helper-dom';

describe('get-style.ts', () => {
	const el = document.createElement('div');
	el.style.display = 'none';
	el.style.float = 'left';

	it('empty', () => {
		expect($.getStyle(el, '')).toBe('');
	});

	it('basic', () => {
		expect($.getStyle(el, 'display')).toBe('none');
		expect($.getStyle(el, 'float')).toBe('left');
		expect($.getStyle(el, 'font-size')).toBe('');
		expect($.getStyle(el, 'font')).toBe('');

		Object.defineProperty(document, 'defaultView', {
			value: null
		});

		expect($.getStyle(el, 'float')).toBe('left');
		expect($.getStyle(el, 'font')).toBe('');
	});
});
