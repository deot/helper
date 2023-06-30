/* eslint-disable no-await-in-loop */
import { ACache } from './cache';

const ALLOW = (() => {
	try {
		window.indexedDB.open;
		return true;
	} catch {
		return false;
	}
})();

interface State {
	[key: string]: any;
	data?: any;
}

class IndexedDBStore extends ACache {
	timestramp: number;

	count: number;

	constructor() {
		super();
		this.options = {
			...this.options,
			keyPath: '__id',
			name: 'default-db',
			storeName: 'default-store',
			version: 1.0
		};

		this.timestramp = new Date().getTime();
		this.count = 0;
	}

	getUid() {
		return `${this.timestramp}${this.count++}`;
	}

	configure(options: ACache['options']) {
		super.configure(options);

		if (typeof this.options.version === 'string') {
			this.options.version = parseInt(this.options.version, 10);	
		}
	}

	// 打开xxx数据库。变更时候更新表
	async openDatabase(): Promise<IDBDatabase> {
		const { name, version, keyPath, storeName } = this.options;
		const poll = () => new Promise((resolve, reject) => {
			let request = window.indexedDB.open(name, version as number);
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = /* istanbul ignore next */ () => {
				reject(new Error('IndexedDB Open Failed. DeleteDatabase first!'));
			};

			// 如果指定版本大于数据库的实际版本号，先删除原来的表，再创建先表
			request.onupgradeneeded = () => {
				let db = request.result;

				if (db.objectStoreNames.contains(storeName)) {
					db.deleteObjectStore(storeName);
				}

				db.createObjectStore(storeName, { keyPath });
			};
		});

		// 当版本不同时，会出现打开失败的情况
		const maxTries = 3;
		let db: any;
		for (let tries = 0; tries < maxTries; tries++) {
			try {
				db = await poll();
			} catch { /* empty */ }
			/* istanbul ignore next -- @preserve */
			if (db || tries === maxTries - 1) {
				break;
			}
		}

		/* istanbul ignore next -- @preserve */
		if (!db) {
			await this.deleteDatabase();
			db = await poll();
		}

		return db as IDBDatabase;
	}

	// 打开表
	async operateBefore(mode?: IDBTransactionMode) {
		const { storeName } = this.options;
		const db = await this.openDatabase();

		// 新建时必须指定表格名称和操作模式（"只读"或"读写"）
		let os = db
			.transaction([storeName], mode || 'readwrite')
			.objectStore(storeName);

		return {
			os,
			db
		};
	}

	// 每次操作完要关闭（浏览器上不关闭，不关闭的话，删库操作会卡一会），"fake-indexeddb/auto"不关闭会卡死
	async operateAfter(operater: { os: IDBObjectStore; db: IDBDatabase }, request: IDBRequest) {
		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				resolve(request);
				operater.db.close();
			};
			request.onerror = /* istanbul ignore next */ (e) => {
				reject(e);
				operater.db.close();
			};
		});
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

	// 新增数据指的是向对象仓库写入数据记录。这需要通过事务完成。
	async write(data: any): Promise<State> {
		const { keyPath } = this.options;
		const operater = await this.operateBefore();
		const state: State = {
			[keyPath]: this.getUid(),
			...data
		};

		const request = operater.os.add(state);
		await this.operateAfter(operater, request);

		return state;
	}

	// 读取数据也是通过事务完成。
	async read(id: string): Promise<State | undefined> {
		const operater = await this.operateBefore();
		const request = operater.os.get(id);
		await this.operateAfter(operater, request);

		return request.result;
	}

	async update(id: string, data: object): Promise<State> {
		const { keyPath } = this.options;
		const operater = await this.operateBefore();
		const state: State = {
			[keyPath]: id,
			...data
		};
		const request = operater.os.put(state);
		await this.operateAfter(operater, request);

		return state;
	}

	async delete(id: string): Promise<any> {
		const operater = await this.operateBefore();
		const request = operater.os.delete(id);

		await this.operateAfter(operater, request);
	}

	async search(): Promise<any[]> {
		const { os, db } = await this.operateBefore();
		const request = os.openCursor();

		let rowData: any[] = [];
		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				let cursor = request.result;
				if (cursor) {
					rowData.push(cursor.value);
					cursor.continue();
				} else {
					resolve(rowData);
					db.close();
				}
			};

			request.onerror = /* istanbul ignore next */ (e) => {
				reject(e);
				db.close();
			};
		});
	}

	// 同Stoage / Cookie使用api
	async get(key: string) {
		if (!ALLOW) return null;
		let v = await this.read(key);

		return this.options.get!(!v ? null : v.data);
	}

	async set(key: string, value: any) {
		if (!ALLOW) return;
		await this.update(key, {
			data: this.options.set!(typeof value === 'string' ? value : JSON.stringify(value))
		});
	}

	async remove(key: string) {
		if (!ALLOW) return;
		await this.delete(key);
	}
}

export const IndexedDB = new IndexedDBStore();