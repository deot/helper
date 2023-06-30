import { Storage } from '@deot/helper-cache';

describe('storage.ts', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('basic', () => {
		expect(typeof Storage.get).toBe('function');
		expect(typeof Storage.set).toBe('function');
		expect(typeof Storage.remove).toBe('function');

		Storage.set('user', { name: 'name' });
		
		expect(Storage.get('user').name).toBe('name');

		Storage.set('user', '{"name": "name1"}');
		expect(Storage.get('user').name).toBe('name1');

		Storage.set('user', 'name');
		expect(Storage.get('user')).toBe('name');

		Storage.remove('user');
		expect(Storage.get('user')).toBe(null);
	});

	it('version', () => {
		Storage.configure({ version: 1.0 });
		expect(Storage.get('user')).toBe(null);

		Storage.set('user', 'name');
		Storage.configure({ version: 1.1 });
		expect(Storage.get('user')).toBe(null);

	});

	it('session', () => {
		Storage.set('user', 'name', { session: true });
		expect(Storage.get('user', { session: true })).toBe('name');
	});

	it('local memory leak', async () => {
		let buffer = '';
		let itemSize = 1024 * 10; // 10kb, 1个字节 = 1b

		for (let k = 0; k < itemSize; k++) {
			buffer += '0';
		}

		const max: number = await new Promise((resolve) => {
			let i = 0;
			const run = () => {
				try {
					localStorage.setItem('___test' + i, buffer);

					++i;
					run();
				} catch (e) {
					resolve(i);
				}
			};

			run();
		});

		let key = '___test' + max;

		Storage.set(key, buffer);
		expect(Storage.get(key)).toBe(buffer);

		Storage.remove(key);
		expect(Storage.get(key)).toBe(null);
	});
});