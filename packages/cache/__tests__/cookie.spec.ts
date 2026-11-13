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

	it('no probe cookie', () => {
		expect(document.cookie.split('; ')).not.toContain('test');
	});

	it('special key', () => {
		Cookie.set('axb', 'wrong');
		Cookie.set('a.b', 'right');

		expect(Cookie.get('a.b')).toBe('right');
		expect(Cookie.get('user[id')).toBe(null);

		Cookie.remove('axb');
		Cookie.remove('a.b');
	});

	it('malformed value', () => {
		document.cookie = 'rate=100%';
		expect(Cookie.get('rate')).toBe('100%');

		Cookie.remove('rate');
	});

	it('expires', () => {
		const spy = vi.spyOn(document, 'cookie', 'set');
		Cookie.set('user', 'name', { path: '/' });

		expect(spy.mock.calls[0][0]).toMatch(/expires=[^;]+GMT;/);
		spy.mockRestore();
		Cookie.remove('user', { path: '/' });
	});

	it('for coverage', () => {
		Cookie.set('user', { name: 'name' }, { days: 1, domain: '/' });
		Cookie.remove('user', { days: 1, domain: '/' });
	});
});
