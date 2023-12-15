import { Cookie } from '@deot/helper-cache';

describe('cookie.ts', () => {
	it('basic', () => {
		expect(typeof Cookie.get).toBe('function');
		expect(typeof Cookie.set).toBe('function');
		expect(typeof Cookie.remove).toBe('function');

		Cookie.set('user', { name: 'name' });

		expect(Cookie.get('user').name).toBe('name');

		Cookie.set('user', '{"name": "name1"}');
		expect(Cookie.get('user').name).toBe('name1');

		Cookie.set('user', 'name');
		expect(Cookie.get('user')).toBe('name');

		Cookie.remove('user');
		expect(Cookie.get('user')).toBe(null);
	});

	it('for coverage', () => {
		Cookie.set('user', { name: 'name' }, { days: 1, domain: '/' });
		Cookie.remove('user', { days: 1, domain: '/' });
	});
});
