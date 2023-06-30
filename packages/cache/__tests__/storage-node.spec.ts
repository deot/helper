import { Storage } from '@deot/helper-cache';

// @vitest-environment node
describe('storage.ts', () => {
	it('node', () => {
		Storage.configure({});
		Storage.set('user', '{"name": "name"}');
		expect(Storage.get('user')).toBe(null);
		Storage.remove('user');
	});
});