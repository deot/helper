import * as Route from '@deot/helper-route';

describe('merge.ts', () => {
	it('merge', () => {
		expect(Route.merge({
			path: '/any/page?id=1',
			query: {
				user: 'deot',
				a: null,
				b: undefined,
				c: ''
			}
		})).toBe('/any/page?id=1&user=deot');

		expect(Route.merge({
			path: ['any', 'page'],
			query: {
				id: 1,
				user: 'deot'
			}
		})).toBe('/any/page?id=1&user=deot');

		expect(Route.merge({
			path: [],
			query: {
				id: 1,
				user: 'deot'
			}
		})).toBe('?id=1&user=deot');

		expect(Route.merge({
			query: {
				id: 1,
				user: 'deot'
			}
		})).toBe('?id=1&user=deot');
	});

	it('empty', () => {
		expect(Route.merge({
			query: {}
		})).toBe('');
		expect(Route.merge({})).toBe('');
		expect(Route.merge({ path: '/any', query: null as any })).toBe('/any');
		expect(Route.merge({ query: { a: null, b: undefined, c: '', d: NaN } })).toBe('');
	});

	it('保留 false 与 0', () => {
		expect(Route.merge({ query: { a: false, b: 0 } })).toBe('?a=false&b=0');
	});

	it('对象与数组', () => {
		const query = { id: { v: 1 }, list: [1, '2'], empty: [] };
		const url = Route.merge({ path: '/any', query });
		expect(url).toBe(`/any?id=${encodeURIComponent('{"v":1}')}&list=${encodeURIComponent('[1,"2"]')}&empty=${encodeURIComponent('[]')}`);
		expect(Route.parse(url).query).toEqual(query);
		expect(Route.get('id', url)).toEqual({ v: 1 });
	});

	it('编码', () => {
		expect(Route.merge({ query: { a: '&' } })).toBe('?a=%26');
		// 已编码的值不会被重复编码
		expect(Route.merge({ query: { a: '%26' } })).toBe('?a=%26');
		expect(Route.merge({ query: { a: '100%' } })).toBe('?a=100%25');
	});

	it('key 编码', () => {
		const query = { 'a&b': 1, '名': 2, 'c=d': 3 };
		const url = Route.merge({ query });
		expect(url).toBe('?a%26b=1&%E5%90%8D=2&c%3Dd=3');
		expect(Route.parse(url).query).toEqual(query);
	});

	it('仅处理自有属性', () => {
		const query = Object.create({ inherited: 1 });
		query.own = 2;
		expect(Route.merge({ query })).toBe('?own=2');
	});

	it('origin', () => {
		expect(Route.merge({ origin: 'https://www.xxx.com', path: '/any' })).toBe('https://www.xxx.com/any');
		expect(Route.merge({ origin: 'https://www.xxx.com/', path: '/any' })).toBe('https://www.xxx.com/any');
		expect(Route.merge({ origin: 'https://www.xxx.com/', path: ['any', 'page'] })).toBe('https://www.xxx.com/any/page');
		expect(Route.merge({ origin: 'https://www.xxx.com/', path: 'any' })).toBe('https://www.xxx.com/any');
		expect(Route.merge({ origin: 'https://www.xxx.com', path: 'any' })).toBe('https://www.xxx.com/any');
		expect(Route.merge({ origin: 'https://www.xxx.com', path: '?a=1', query: { id: 1 } })).toBe('https://www.xxx.com?a=1&id=1');
		expect(Route.merge({ origin: 'https://www.xxx.com', path: '#top', query: { id: 1 } })).toBe('https://www.xxx.com?id=1#top');
		expect(Route.merge({ origin: 'https://www.xxx.com', query: { id: 1 } })).toBe('https://www.xxx.com?id=1');
		expect(Route.merge({ path: 'any/page' })).toBe('any/page');
	});

	it('已有查询串', () => {
		expect(Route.merge({ path: '/any?', query: { id: 1 } })).toBe('/any?id=1');
		expect(Route.merge({ path: '/any?a=1&', query: { id: 1 } })).toBe('/any?a=1&id=1');
	});

	it('锚点', () => {
		expect(Route.merge({ path: '/any#top', query: { id: 1 } })).toBe('/any?id=1#top');
		expect(Route.merge({ path: '/any?a=1#top', query: { id: 1 } })).toBe('/any?a=1&id=1#top');
		expect(Route.merge({ path: '/any#', query: { id: 1 } })).toBe('/any?id=1#');
		expect(Route.merge({ path: '/any#top' })).toBe('/any#top');
	});

	it('hash 路由', () => {
		expect(Route.merge({ path: '/#/page', query: { id: 1 } })).toBe('/#/page?id=1');
		expect(Route.merge({ path: '/#!/page', query: { id: 1 } })).toBe('/#!/page?id=1');
		expect(Route.merge({ path: '/#/page?a=1', query: { id: 1 } })).toBe('/#/page?a=1&id=1');
		expect(Route.merge({ path: '/?a=1#/page', query: { id: 1 } })).toBe('/?a=1#/page?id=1');

		const url = 'https://www.xxx.com/#/page?id=1';
		expect(Route.merge(Route.parse(url))).toBe(url);
	});

	it('往返', () => {
		const route = {
			origin: 'https://www.xxx.com',
			path: '/any/page',
			query: { id: 1, name: 'a b&c=d', enabled: false, o: { v: [1, 2] } }
		};
		expect(Route.parse(Route.merge(route))).toEqual(route);
	});

	it('类型', () => {
		expectTypeOf(Route.merge).parameter(0).toEqualTypeOf<Route.Route>();
	});
});
