import * as Route from '@deot/helper-route';

describe('parse.ts', () => {
	it('query', () => {
		expect(Route.parse('/any/page?id=1').query?.id).toBe(1);
		expect(Route.parse('/any/page?id={"v":1}').query?.id).toEqual({ v: 1 });
		expect(Route.parse('/any/page?id=001').query?.id).toBe('001');
		expect(Route.parse('/any/page?id=').query?.id).toBe('');
		expect(Route.parse('/any/page?id=0').query?.id).toBe(0);
		expect(Route.parse('/any/page?id=0', { parse: false }).query?.id).toBe('0');
		expect(Route.parse('/any/page?id={"v":1}', { parse: false }).query?.id).toBe('{"v":1}');

		expect(typeof Route.parse({})).toBe('object');
	});

	it('query empty', () => {
		expect(Route.parse('').query).toEqual({});
	});

	it('path', () => {
		const it = Route.parse('/any/page?id=1');
		expect(it.path).toBe('/any/page');
	});

	it('path empty', () => {
		const it = Route.parse('?id=1');
		expect(it.path).toBe('');
	});

	it('origin', () => {
		const it = Route.parse('xxx.xx');
		expect(it.origin).toBe('xxx.xx');
	});

	it('origin empty', () => {
		const it = Route.parse('');
		expect(it.origin).toBe('');
	});

	it('multiple', () => {
		expect(Route.parse('?id=&_id=1').query._id).toBe(1);
		expect(Route.parse('?id=a&_id=1').query._id).toBe(1);
	});

	it('url', () => {
		const current = Route.parse('https://www.xxx.com?id=1');
		expect(current.query.id).toBe(1);
		expect(current.path).toBe('');
		expect(current.origin).toBe('https://www.xxx.com');
	});

	it('url /', () => {
		const current = Route.parse('https://www.xxx.com/?id=1');
		expect(current.path).toBe('/');
	});

	it('url //', () => {
		const current = Route.parse('https://www.xxx.com//?id=1');
		expect(current.path).toBe('//');
	});

	it('coverage', () => {
		expect(Route.parse('? ')).toEqual({
			origin: '',
			path: '',
			query: {}
		});
	});

	it('值中含 = 或 ?', () => {
		expect(Route.parse('?token=YWJj==&x=1').query).toEqual({ token: 'YWJj==', x: 1 });
		expect(Route.parse('/a?redirect=/b?c=1&d=2')).toEqual({
			origin: '',
			path: '/a',
			query: { redirect: '/b?c=1', d: 2 }
		});
	});

	it('hash', () => {
		expect(Route.parse('/p?id=1#top')).toEqual({
			origin: '',
			path: '/p',
			query: { id: 1 }
		});
		expect(Route.parse('/p?id=1#/page?id=2').query).toEqual({ id: 1 });
		// hash 路由：`#` 在 `?` 之前，参数仍可读取
		expect(Route.parse('https://www.xxx.com/#/page?id=1')).toEqual({
			origin: 'https://www.xxx.com',
			path: '/#/page',
			query: { id: 1 }
		});
	});

	it('重复的 key 取第一个', () => {
		expect(Route.parse('?a=1&a=2').query).toEqual({ a: 1 });
		expect(Route.parse('?a=&a=2').query).toEqual({ a: '' });
		expect(Route.parse('?%E5%90%8D=1&名=2').query).toEqual({ 名: 1 });
	});

	it('无值参数', () => {
		expect(Route.parse('?debug&id=1').query).toEqual({ debug: '', id: 1 });
		expect(Route.parse('?&=1&&id=1&').query).toEqual({ id: 1 });
	});

	it('key 编码', () => {
		expect(Route.parse('?%E5%90%8D=1&a%5B0%5D=2&a%26b=3').query).toEqual({
			'名': 1,
			'a[0]': 2,
			'a&b': 3
		});
	});

	it('__proto__', () => {
		const { query } = Route.parse('?__proto__={"isAdmin":true}&constructor=1&toString=2');
		expect(query.isAdmin).toBe(undefined);
		expect(({} as any).isAdmin).toBe(undefined);
		expect(Object.getPrototypeOf(query)).toBe(Object.prototype);
		expect(Object.keys(query)).toEqual(['__proto__', 'constructor', 'toString']);
		expect(Object.getOwnPropertyDescriptor(query, '__proto__')?.value).toEqual({ isAdmin: true });
		expect(query.constructor).toBe(1);
		expect(query.toString).toBe(2);
	});

	it('parse', () => {
		expect(Route.parse('?id=1', { parse: true }).query).toEqual({ id: 1 });
		expect(Route.parse({ url: '?id=1', parse: undefined }).query).toEqual({ id: 1 });
		expect(Route.parse('?id=1&name=deot', { parse: v => `${v}!` }).query).toEqual({ id: '1!', name: 'deot!' });
	});

	it('与 get 一致', () => {
		const url = 'https://www.xxx.com/any/page?a=1&a=2&token=YWJj==&debug&%E5%90%8D=x&redirect=/b?c=1&o={"v":1}#top';
		const { query } = Route.parse(url);
		expect(Object.keys(query)).toEqual(['a', 'token', 'debug', '名', 'redirect', 'o']);
		Object.keys(query).forEach((key) => {
			expect(Route.get(key, url)).toEqual(query[key]);
		});
	});

	it('类型', () => {
		expectTypeOf(Route.parse('')).toEqualTypeOf<Route.ParsedRoute>();
		expectTypeOf<Route.ParseOptions>().toHaveProperty('url');
	});
});
