import * as $ from '@deot/helper-dom';

// @vitest-environment node
describe('environment node', () => {
	const el = {} as HTMLElement;
	it('add-class', () => {
		expect($.addClass(el, '')).toBe(undefined);
	});

	it('has-class', () => {
		expect($.hasClass(el, '')).toBe(false);
	});

	it('remove-class', () => {
		expect($.removeClass(el, '')).toBe(undefined);
	});

	it('on', () => {
		const off = $.on(el, 'click', () => {});
		expect(typeof off).toBe('function');
		off();
	});

	it('off', () => {
		expect($.off(el, 'click', () => {})).toBe(undefined);
	});

	it('once', () => {
		const off = $.once(el, 'click', () => {});
		expect(typeof off).toBe('function');
		off();
	});

	it('get-style', () => {
		expect($.getStyle(el, '')).toBe('');
	});

	it('set-style', () => {
		expect($.setStyle(el, '', '')).toBe(undefined);
	});

	it('prefix-style', () => {
		expect($.prefixStyle('transform')).toEqual({
			camel: 'transform',
			kebab: 'transform'
		});
	});

	it('el', () => {
		expect($.el('el')).toBe(null);
	});

	it('composed-path', () => {
		expect($.composedPath({} as Event)).toEqual([]);
	});

	it('contains', () => {
		expect($.contains(el, el)).toBe(false);
	});

	it('get-scroller', () => {
		expect($.getScroller(el, { direction: 'x' })).toBe(null);
	});

	it('is-scroller', () => {
		expect($.isScroller(el, { direction: 'x' })).toBe(false);
	});

	it('scroll-into-view', async () => {
		const result = await $.scrollIntoView(el, {});
		expect(result).toBe(undefined);
	});
});
