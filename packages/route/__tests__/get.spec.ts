import * as Route from '@deot/helper-route';

describe('get.ts', () => {
	it('get', () => {
		expect(Route.get('id')).toBe(null);
		expect(Route.get('id', '?id=')).toBe('');
		expect(Route.get('id', '?id=1')).toBe(1);
		expect(Route.get('id', '?id=false')).toBe(false);
		expect(Route.get('id', '?id=true')).toBe(true);
		expect(Route.get('id', '?id=10000001')).toBe(10000001);
		expect(Route.get('id', '?id=01')).toBe('01');
		expect(Route.get('id', '?id=00000000000000001')).toBe('00000000000000001');

		expect(Route.get('id', '?id=9007199254740991')).toBe(Number.MAX_SAFE_INTEGER);
		expect(Route.get('id', '?id=9007199254740992')).toBe('9007199254740992');

		expect(Route.get('id', '?id=%25')).toBe('%');
		expect(Route.get('id', '?id=%2525')).toBe('%');
		expect(Route.get('id', '?id={"v":1}')).toEqual({ v: 1 });
		expect(Route.get('id', '?id=%7B%22v%22%3A1%7D').v).toBe(1);
		expect(typeof Route.get('id', '?id={"v":1}')).toBe('object');

		expect(Route.get('id', { url: '?id=' })).toBe('');
		expect(Route.get('id', { url: '?id={"v":1}', parse: false })).toBe('{"v":1}');
		expect(Route.get('id', { url: '?id=1', parse: false })).toBe('1');
		expect(Route.get('id', { url: '?id=false', parse: false })).toBe('false');
	});

	it('multiple', () => {
		expect(Route.get('_id', '?id=&_id=1')).toBe(1);
		expect(Route.get('_id', '?id=a&_id=1')).toBe(1);
	});

	it('?&=', () => {
		expect(Route.get('id', `?id=${encodeURIComponent(JSON.stringify({ '?&id=1': '?&id=1' }))}&_id=1`))
			.toEqual({ '?&id=1': '?&id=1' });
	});

	it('key 含正则特殊字符', () => {
		expect(Route.get('a(', '?a(=1')).toBe(1);
		expect(Route.get('a[0]', '?a[0]=1')).toBe(1);
		expect(Route.get('a.b', '?axb=1')).toBe(null);
		expect(Route.get('a.b', '?a.b=1')).toBe(1);
		expect(Route.get('a+', '?aa=1&a+=2')).toBe(2);
	});

	it('key 编码', () => {
		expect(Route.get('名', '?%E5%90%8D=1')).toBe(1);
		expect(Route.get('a[0]', '?a%5B0%5D=1')).toBe(1);
		// 兼容直接传入已编码的 key
		expect(Route.get('%E5%90%8D', '?%E5%90%8D=1')).toBe(1);
	});

	it('值中含 = 或 ?', () => {
		expect(Route.get('token', '?token=YWJj==&x=1')).toBe('YWJj==');
		expect(Route.get('redirect', '/a?redirect=/b?c=1&d=2')).toBe('/b?c=1');
		expect(Route.get('d', '/a?redirect=/b?c=1&d=2')).toBe(2);
	});

	it('hash', () => {
		expect(Route.get('id', '/p?id=1#top')).toBe(1);
		expect(Route.get('id', '/p?id=1#/page?id=2')).toBe(1);
		// hash 路由：`#` 在 `?` 之前，参数仍可读取
		expect(Route.get('id', 'https://xxx.com/#/page?id=1')).toBe(1);
		expect(Route.get('id', 'id=1#top')).toBe(1);
	});

	it('重复的 key 取第一个', () => {
		expect(Route.get('a', '?a=1&a=2')).toBe(1);
	});

	it('无值参数', () => {
		expect(Route.get('debug', '?debug&id=1')).toBe('');
		expect(Route.get('id', '?debug&id=1')).toBe(1);
		expect(Route.get('debug', '?id=1')).toBe(null);
		expect(Route.get('', '?=1&&')).toBe(null);
	});

	it('无 ? 时视为查询串', () => {
		expect(Route.get('id', 'id=1&name=deot')).toBe(1);
		expect(Route.get('name', 'id=1&name=deot')).toBe('deot');
	});

	it('parse', () => {
		expect(Route.get('id', { url: '?id=1', parse: true })).toBe(1);
		expect(Route.get('id', { url: '?id=1', parse: undefined })).toBe(1);
		expect(Route.get('id', '?id=1', { parse: v => `${v}!` })).toBe('1!');
		expect(Route.get('id', '?id=%257B%2522v%2522%253A1%257D', { parse: false })).toBe('{"v":1}');
	});

	it('类型', () => {
		const value = Route.get<number>('id', '?id=1');
		expectTypeOf(value).toEqualTypeOf<number | null>();
		expectTypeOf<Route.GetOptions>().toHaveProperty('parse');
	});
});
