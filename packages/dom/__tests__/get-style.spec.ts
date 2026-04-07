import * as $ from '@deot/helper-dom';

describe('get-style.ts', () => {
	const el = document.createElement('div');
	el.style.display = 'none';
	el.style.float = 'left';
	el.style.fontSize = '14px';
	el.style.font = '14px Arial, sans-serif';

	it('empty', () => {
		expect($.getStyle(el, '')).toBe('');
	});

	it('basic', () => {
		expect($.getStyle(el, 'display')).toBe('none');
		expect($.getStyle(el, 'float')).toBe('left');
		expect($.getStyle(el, 'font-size')).toBe('14px');
		expect($.getStyle(el, 'font')).toBe('14px Arial, sans-serif');

		Object.defineProperty(document, 'defaultView', {
			value: null
		});

		expect($.getStyle(el, 'float')).toBe('left');
		expect($.getStyle(el, 'font')).toBe('14px Arial, sans-serif');
	});
});
