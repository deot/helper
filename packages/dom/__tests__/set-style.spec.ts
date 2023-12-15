import * as $ from '@deot/helper-dom';

describe('set-style.ts', () => {
	const el = document.createElement('div');
	el.style.display = 'none';
	el.style.float = 'left';

	it('empty', () => {
		expect($.setStyle(el, '')).toBe(undefined);
	});

	it('basic', () => {
		$.setStyle(el, 'display', 'block');
		expect($.getStyle(el, 'display')).toBe('block');

		$.setStyle(el, {
			'font-size': '14px'
		});

		expect($.getStyle(el, 'font-size')).toBe('14px');
	});
});
