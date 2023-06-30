import { Cookie } from '@deot/helper-cache';

// @vitest-environment node
describe('cookie.ts', () => {
	it('node', () => {
		Cookie.set('user', '{"name": "name"}');
		expect(Cookie.get('user')).toBe(null);
		Cookie.remove('user');
	});
});