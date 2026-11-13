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

	it('custom properties', () => {
		const style = document.createElement('style');
		style.textContent = '.get-style-var { --from-sheet:  8px ; }';
		document.head.appendChild(style);

		const target = document.createElement('div');
		target.className = 'get-style-var';
		document.body.appendChild(target);

		// 计算样式
		expect($.getStyle(target, '--from-sheet')).toBe('8px');
		expect($.getStyle(target, '--missing')).toBe('');

		// 行内样式
		target.style.setProperty('--inline', '4px');
		expect($.getStyle(target, '--inline')).toBe('4px');
	});

	it('node without style', () => {
		expect($.getStyle(document.createDocumentFragment() as unknown as Element, 'overflow')).toBe('');
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

		// 取不到计算样式时，行内没有的属性返回空字符串
		expect($.getStyle(el, 'color')).toBe('');
	});
});
