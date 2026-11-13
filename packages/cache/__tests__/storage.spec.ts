import { Storage } from '@deot/helper-cache';

const buffer = '0'.repeat(1024 * 10); // 10kb, 1个字节 = 1b

// 写满localStorage，返回写入的条数
const fill = () => {
	let i = 0;
	try {
		for (;;) {
			localStorage.setItem('___test' + i, buffer);
			++i;
		}
	} catch {
		return i;
	}
};

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

	it('versions', () => {
		Storage.configure({ version: 1.0 });
		expect(Storage.get('user')).toBe(null);

		Storage.set('user', 'name');
		Storage.configure({ version: 1.1, versions: [1.0, 1.1] });
		expect(Storage.get('user')).toBe(null);
		expect(Storage.get('user', { version: 1.0 })).toBe('name');
	});

	it('session', () => {
		Storage.set('user', 'name', { session: true });
		expect(Storage.get('user', { session: true })).toBe('name');
	});

	it('version, exact match', () => {
		Storage.configure({ version: 12, versions: [] });
		Storage.set('user', 'name');
		expect(localStorage.getItem('@deot/helper/12:user')).toBe('name');

		Storage.configure({ version: 1 });
		expect(localStorage.getItem('@deot/helper/12:user')).toBe(null);
	});

	it('without version', () => {
		Storage.configure({ version: 2, versions: [] });
		Storage.set('user', 'name');

		// 未设置版本时不清理
		Storage.configure({ version: '' });
		expect(Storage.get('user', { version: 2 })).toBe('name');

		// 原型上的key
		expect(Storage.get('toString')).toBe(null);
		expect(Storage.get('constructor')).toBe(null);
	});

	it('local memory leak', () => {
		const key = '___test' + fill();

		Storage.set(key, buffer);
		expect(Storage.get(key)).toBe(buffer);

		Storage.remove(key);
		expect(Storage.get(key)).toBe(null);
	});

	it('local memory stale', () => {
		const key = '___test' + fill();

		// 容量已满，回退到内存
		Storage.set(key, buffer);
		expect(localStorage.getItem(key)).toBe(null);
		expect(Storage.get(key)).toBe(buffer);

		// 容量恢复后写入成功，不应再读到内存中的旧值
		localStorage.clear();
		Storage.set(key, 'name');
		expect(localStorage.getItem(key)).toBe('name');
		expect(Storage.get(key)).toBe('name');

		Storage.remove(key);
	});

	it('probe', async () => {
		localStorage.setItem('test', 'keep');
		const key = '___test' + fill();

		vi.resetModules();
		const { Storage: Fresh } = await import('@deot/helper-cache');

		// 加载时不误删业务的key，容量已满时仍可读写
		expect(localStorage.getItem('test')).toBe('keep');
		expect(Fresh.get('test')).toBe('keep');

		Fresh.set(key, buffer);
		expect(Fresh.get(key)).toBe(buffer);
	});
});
