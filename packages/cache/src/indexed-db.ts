import { ACache } from './cache';

class IndexedDBStore extends ACache {
	constructor(options?: ACache['options']) {
		super();
		this.options = {
			...this.options,
			keyPath: '__id',
			name: 'default-db',
			storeName: 'default-store',
			version: 1.0
		};

		options && this.configure(options);
	}

	configure(options: ACache['options']) {
		super.configure(options);

		if (typeof this.options.version === 'string') {
			this.options.version = parseInt(this.options.version, 10);	
		}
	}

	// 打开xxx数据库。变更时候更新表
	openDatabase(): Promise<IDBDatabase> {
		const { name, version, keyPath, storeName } = this.options;
		return new Promise((resolve, reject) => {
			let request = window.indexedDB.open(name, version as number);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(new Error('IndexedDB Open Failed.'));

			// 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件
			request.onupgradeneeded = () => {
				let db = request.result;

				// 判断是否存在该表 主键为__id
				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath });
				}
				resolve(db);
			};
		});
	}

	// 打开表
	async openObjectStore() {
		const { storeName } = this.options;
		const db = await this.openDatabase();

		// 新建时必须指定表格名称和操作模式（"只读"或"读写"）
		return db
			.transaction([storeName], 'readwrite')
			.objectStore(storeName);
	}


	// 删库
	async deleteDatabase() {
		const { name } = this.options;
		const request = window.indexedDB.deleteDatabase(name);

		await new Promise((resolve, reject) => {
			request.onsuccess = resolve;
			request.onerror = reject;
		});
	}

	// 删表
	async deleteObjectStore() {
		const { storeName } = this.options;
		const db = await this.openDatabase();
		db.deleteObjectStore(storeName || this.options.storeName);
	}

	async close() {
		const db = await this.openDatabase();
		db.close();
		return db;
	}

	// 新增数据指的是向对象仓库写入数据记录。这需要通过事务完成。
	async write(data: any) {
		const os = await this.openObjectStore();
		const request = os.add(data);

		await new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = reject;
		});
	}

	// 读取数据也是通过事务完成。
	async read(key: string) {
		const os = await this.openObjectStore();
		const request = os.get(key);

		await new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = reject;
		});
	}

	async update(data: any) {
		const os = await this.openObjectStore();
		const request = os.put(data); // data中含主键

		await new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = reject;
		});
	}

	async delete(key: string) {
		const os = await this.openObjectStore();
		const request = os.delete(key);

		await new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = reject;
		});
	}

	async search() {
		const os = await this.openObjectStore();
		const request = os.openCursor();

		let rowData: any[] = [];
		await new Promise((resolve, reject) => {
			request.onsuccess = () => {
				let cursor = request.result;
				if (cursor) {
					let current = cursor.value;
					rowData.push(current);
					cursor.continue();
				}
				resolve(rowData);
			};

			request.onerror = reject;
		});
	}

	async get(key: string) {
		let value = await this.read(key);

		return this.options.get(value);
	}

	async set(key: string, value: any) {
		const { keyPath } = this.options;
		await this.update({
			[keyPath]: key,
			data: this.options.set(typeof value === 'string' ? value : JSON.stringify(value))
		});
	}

	async remove(key: string) {
		await this.delete(key);
	}
}

export const IndexedDB = new IndexedDBStore();