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

/**
 * 一个实例只打开1个db, 如需打开多个，可以实例化多个IndexedDBStore
 */
export class IndexedDBStore extends ACache {
	timestramp = new Date().getTime();

	count = 0;

	db: Promise<IDBDatabase> | null = null;

	pending: Promise<any>[] = [];

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

	getUid() {
		return `${this.timestramp}${this.count++}`;
	}

	configure(options: ACache['options']) {
		super.configure(options);

		if (typeof this.options.version === 'string') {
			this.options.version = parseInt(this.options.version, 10);
		}
	}

	/**
	 * 每次操作完要关闭
	 * 	1. 浏览器上不关闭的话，删库操作会卡一会
	 * 	2. fake-indexeddb不关闭会卡死
	 * @param fn ~
	 * @returns ~
	 */
	private concurrent<T = void>(fn: Function): Promise<T> {
		const target = new Promise<T>((resolve, reject) => {
			fn().then(resolve).catch(reject);
		});

		this.pending.push(target);
		target.finally(() => this.close(target));
		return target;
	}

	/**
	 * 统一处理
	 * @param request ~
	 * @returns ~
	 */
	private async task(request: IDBRequest): Promise<any> {
		return new Promise((resolve, reject) => {
			request.onsuccess = resolve;
			request.onerror = reject;
		});
	}

	/**
	 * @param target ~
	 */
	async close(target?: Promise<any>) {
		if (target) {
			this.pending = this.pending.filter(i => i !== target);
		} else {
			const done = async (pending: Promise<any>[]) => {
				if (pending.length) {
					await Promise.allSettled(pending);
					await done(this.pending);
				}
			};
			await done(this.pending);
		}

		if (!this.pending.length && this.db) {
			const db = this.db;
			this.db = null;

			(await db).close();
		}
	}

	/**
	 * 打开数据库。变更时候更新表
	 * @returns ~
	 */
	openDatabase(): Promise<IDBDatabase> {
		this.db = this.db || (async () => {
			const { name, version, keyPath, storeName } = this.options;
			const poll = () => new Promise((resolve, reject) => {
				const request = window.indexedDB.open(name, version as number);
				request.onsuccess = () => {
					resolve(request.result);
				};
				request.onerror = /* istanbul ignore next */ () => {
					reject(new Error('IndexedDB Open Failed. DeleteDatabase first!'));
				};

				// 如果指定版本大于数据库的实际版本号，先删除原来的表，再创建先表
				request.onupgradeneeded = () => {
					const db = request.result;

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
				} catch (_) { /* empty */ }
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
		})();

		return this.db;
	}

	/**
	 * 打开表
	 * tip: db.close() 执行后
	 * 	db打开后的表os对象仍可写入（浏览器支持，fake-indexeddb不支持）
	 * 	不过正常理解也应该操作所有后再关闭，这里不修改`this.db -> this.os`的逻辑
	 * @param mode ~
	 * @returns ~
	 */
	async openObjectStore(mode?: IDBTransactionMode): Promise<IDBObjectStore> {
		const { storeName } = this.options;
		const db = await this.openDatabase();

		// 新建时必须指定表格名称和操作模式（"只读"或"读写"）
		const os = db
			.transaction([storeName], mode || 'readwrite')
			.objectStore(storeName);

		return os;
	}

	/**
	 * 删库
	 */
	async deleteDatabase() {
		const { name } = this.options;
		const request = window.indexedDB.deleteDatabase(name);

		await new Promise((resolve, reject) => {
			request.onsuccess = resolve;
			request.onerror = reject;
		});
	}

	/**
	 * 新增数据，通过事务完成。
	 * @param data ~
	 * @returns ~
	 */
	write(data: any): Promise<State> {
		return this.concurrent<State>(async () => {
			const { keyPath } = this.options;
			const os = await this.openObjectStore();
			const state: State = {
				[keyPath]: this.getUid(),
				...data
			};

			const request = os.add(state);

			await new Promise((resolve, reject) => {
				request.onsuccess = resolve;
				request.onerror = reject;
			});

			return state;
		});
	}

	/**
	 * 读取数据，通过事务完成。
	 * @param id ~
	 * @returns ~
	 */
	read(id: string): Promise<State | undefined> {
		return this.concurrent<State | undefined>(async () => {
			const os = await this.openObjectStore();
			const request = os.get(id);
			await this.task(request);

			return request.result;
		});
	}

	/**
	 * 更新数据，通过事务完成。
	 * @param id ~
	 * @param data ~
	 * @returns ~
	 */
	update(id: string, data: object): Promise<State> {
		return this.concurrent<State>(async () => {
			const { keyPath } = this.options;
			const os = await this.openObjectStore();
			const state: State = {
				[keyPath]: id,
				...data
			};
			const request = os.put(state);
			await this.task(request);

			return state;
		});
	}

	/**
	 * 删除数据也是通过事务完成。
	 * @param id ~
	 * @returns ~
	 */
	async delete(id: string): Promise<void> {
		return this.concurrent(async () => {
			const os = await this.openObjectStore();
			const request = os.delete(id);

			await this.task(request);
		});
	}

	/**
	 * 搜索数据，通过事务完成。
	 * @returns ~
	 */
	search(): Promise<State[]> {
		return this.concurrent<State[]>(async () => {
			const os = await this.openObjectStore();
			const request = os.openCursor();

			const rowData: State[] = [];
			await new Promise((resolve, reject) => {
				request.onsuccess = () => {
					const cursor = request.result;
					if (cursor) {
						rowData.push(cursor.value);
						cursor.continue();
					} else {
						resolve(rowData);
					}
				};
				request.onerror = reject;
			});
			return rowData;
		});
	}

	// 同Stoage / Cookie使用api
	async get(key: string) {
		if (!ALLOW) return null;
		const v = await this.read(key);

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

// 导出一个默认的，方便直接操作
export const IndexedDB = new IndexedDBStore();
