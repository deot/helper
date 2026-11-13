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

	it('custom properties', () => {
		const target = document.createElement('div');
		$.setStyle(target, '--gap', '4px');
		expect(target.style.getPropertyValue('--gap')).toBe('4px');
		expect($.getStyle(target, '--gap')).toBe('4px');

		// 数字原样写入
		$.setStyle(target, { '--columns': 3, '--gap': '8px' });
		expect(target.style.getPropertyValue('--columns')).toBe('3');
		expect(target.style.getPropertyValue('--gap')).toBe('8px');

		// 空值即移除
		$.setStyle(target, '--gap', null);
		$.setStyle(target, '--columns');
		expect(target.style.getPropertyValue('--gap')).toBe('');
		expect(target.style.getPropertyValue('--columns')).toBe('');
		expect(target.getAttribute('style') || '').toBe('');
	});
});
