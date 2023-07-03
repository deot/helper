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
	});
});

