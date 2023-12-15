import * as Route from '@deot/helper-route';

// @vitest-environment node
describe('environment node', () => {
	it('get', () => {
		expect(Route.get('id')).toBe(null);
	});
	it('parse', () => {
		expect(Route.parse('')).toEqual({
			origin: '',
			path: '',
			query: {}
		});
	});
});
