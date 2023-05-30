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
});

