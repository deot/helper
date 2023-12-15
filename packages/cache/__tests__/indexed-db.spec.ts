import 'fake-indexeddb/auto';
import { IndexedDB, IndexedDBStore } from '@deot/helper-cache';

describe('indexed-db.ts', () => {
	afterEach(async () => {
		await IndexedDB.deleteDatabase();
	});
	it('basic', async () => {
		expect(typeof IndexedDB.get).toBe('function');
		expect(typeof IndexedDB.set).toBe('function');
		expect(typeof IndexedDB.remove).toBe('function');

		await IndexedDB.set('user', { name: 'name' });
		expect((await IndexedDB.get('user')).name).toBe('name');

		await IndexedDB.set('user', '{"name": "name1"}');
		expect((await IndexedDB.get('user')).name).toBe('name1');

		IndexedDB.configure({ version: 2 });
		IndexedDB.configure({ version: '3' });

		await IndexedDB.set('user', 'name');
		expect(await IndexedDB.get('user')).toBe('name');

		await IndexedDB.remove('user');
		expect(await IndexedDB.get('user')).toBe(null);
	});

	it('configure', async () => {
		IndexedDB.configure({ version: 2 });
		IndexedDB.configure({ version: '3' });
	});

	it('write', async () => {
		const data = await IndexedDB.write({ name: 'name' });
		expect(data.name).toBe('name');
	});

	it('search', async () => {
		await IndexedDB.write({ key: 'name0' });
		await IndexedDB.write({ key: 'name0' });
		await IndexedDB.write({ key1: 'name1' });
		await IndexedDB.write({ key1: 'name1' });
		await IndexedDB.write({ key1: 'name1' });
		await IndexedDB.write({ key2: 'name2' });
		await IndexedDB.write({ key3: 'name3' });
		await IndexedDB.write({ key4: 'name3' });

		const data = await IndexedDB.search();
		expect(data.length).toBe(8);
	});

	// 连续写入
	it('batch', async () => {
		const store = new IndexedDBStore({
			name: 'db',
			storeName: 'store'
		});

		const length = 100;
		Array
			.from({ length })
			.forEach((_: any, index: number) => {
				store.write({ value: index });
			});

		expect(store.pending.length).toBe(length);
		await store.close();
		const data = await store.search();
		expect(data.length).toBe(length);
	});
});
