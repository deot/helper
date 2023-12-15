import { Cookie, IndexedDB, Storage } from '@deot/helper-cache';

// @vitest-environment node
describe('environment node', () => {
	it('cookie', () => {
		Cookie.set('user', '{"name": "name"}');
		expect(Cookie.get('user')).toBe(null);
		Cookie.remove('user');
	});

	it('indexed-db', async () => {
		IndexedDB.configure({});
		await IndexedDB.set('user', '{"name": "name"}');
		expect(await IndexedDB.get('user')).toBe(null);
		await IndexedDB.remove('user');
	});

	it('storage', () => {
		Storage.configure({});
		Storage.set('user', '{"name": "name"}');
		expect(Storage.get('user')).toBe(null);
		Storage.remove('user');
	});
});
