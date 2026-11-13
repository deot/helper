import * as $ from '@deot/helper-dom';

describe('prefix-style.ts', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	// 以指定的 style 对象模拟浏览器对属性的支持情况；探测结果有模块级缓存，需重新加载模块
	const load = async (style: Record<string, string>) => {
		vi.resetModules();
		const createElement = vi.spyOn(document, 'createElement').mockReturnValue({ style } as any);
		const { prefixStyle } = await import('@deot/helper-dom');
		return { prefixStyle, createElement };
	};

	it('standard properties are not prefixed', () => {
		expect($.prefixStyle('transform')).toEqual({ camel: 'transform', kebab: 'transform' });
		expect($.prefixStyle('opacity')).toEqual({ camel: 'opacity', kebab: 'opacity' });
	});

	it('accepts camelCase and kebab-case', () => {
		const expected = { camel: 'userSelect', kebab: 'user-select' };
		expect($.prefixStyle('userSelect')).toEqual(expected);
		expect($.prefixStyle('user-select')).toEqual(expected);
	});

	it('result can be used with setStyle', () => {
		const el = document.createElement('div');
		$.setStyle(el, $.prefixStyle('opacity').camel, '0.5');
		$.setStyle(el, $.prefixStyle('user-select').kebab, 'none');
		expect(el.style.opacity).toBe('0.5');
		expect(el.style.userSelect).toBe('none');
	});

	it('custom, prefixed and empty names are returned as is', () => {
		['--gap', '-webkit-line-clamp', ''].forEach((v) => {
			expect($.prefixStyle(v)).toEqual({ camel: v, kebab: v });
		});
	});

	it('prefixed only', async () => {
		const { prefixStyle } = await load({
			webkitLineClamp: '',
			MozOrient: '',
			msGridRows: '',
			OTabSize: ''
		});

		expect(prefixStyle('lineClamp')).toEqual({ camel: 'webkitLineClamp', kebab: '-webkit-line-clamp' });
		expect(prefixStyle('line-clamp')).toEqual({ camel: 'webkitLineClamp', kebab: '-webkit-line-clamp' });
		expect(prefixStyle('orient')).toEqual({ camel: 'MozOrient', kebab: '-moz-orient' });
		expect(prefixStyle('grid-rows')).toEqual({ camel: 'msGridRows', kebab: '-ms-grid-rows' });
		expect(prefixStyle('tabSize')).toEqual({ camel: 'OTabSize', kebab: '-o-tab-size' });
	});

	it('standard wins over prefixed', async () => {
		const { prefixStyle } = await load({ transform: '', webkitTransform: '' });
		expect(prefixStyle('transform')).toEqual({ camel: 'transform', kebab: 'transform' });
	});

	it('unsupported falls back to the standard name', async () => {
		const { prefixStyle } = await load({});
		expect(prefixStyle('unknownProp')).toEqual({ camel: 'unknownProp', kebab: 'unknown-prop' });
	});

	it('detects lazily and caches per property', async () => {
		const { prefixStyle, createElement } = await load({ webkitLineClamp: '' });
		expect(createElement).toHaveBeenCalledTimes(0);

		prefixStyle('lineClamp');
		prefixStyle('lineClamp');
		prefixStyle('transform');
		expect(createElement).toHaveBeenCalledTimes(1);
	});
});
