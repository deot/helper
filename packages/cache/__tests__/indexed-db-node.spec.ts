import { IndexedDB } from '@deot/helper-cache';

// @vitest-environment node
describe('storage.ts', () => {
	it('node', async () => {
		IndexedDB.configure({});
		await IndexedDB.set('user', '{"name": "name"}');
		expect(await IndexedDB.get('user')).toBe(null);
		await IndexedDB.remove('user');
	});
});