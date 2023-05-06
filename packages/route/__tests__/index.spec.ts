import * as Route from '@deot/helper-route';

describe('index.ts', () => {
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

		expect(Route.get('id', '%3Fid%3D1')).toBe(1);
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
			query: {
				id: 1,
				user: 'deot'
			}
		})).toBe('?id=1&user=deot');
	});

	it('parse', () => {
		expect(Route.parse('/any/page?id=1').query?.id).toBe(1);
		expect(Route.parse('/any/page?id={"v":1}').query?.id).toEqual({ v: 1 });
		expect(Route.parse('/any/page?id=001').query?.id).toBe('001');
		expect(Route.parse('/any/page?id=').query?.id).toBe('');
		expect(Route.parse('/any/page?id=0').query?.id).toBe(0);
		expect(Route.parse('/any/page?id=0', { parse: false }).query?.id).toBe('0');
		expect(Route.parse('/any/page?id={"v":1}', { parse: false }).query?.id).toBe('{"v":1}');

		expect(typeof Route.parse({})).toBe('object');
	});
});

