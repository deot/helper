import { IS_SERVER } from '@deot/helper-shared';
import { flattenJSONParse } from '@deot/helper-utils';
import { Cache } from './cache';
import { MemoryStorage } from './memory-storage';

const PREFIX_NAME = '@deot/helper/';
const formatKey = (key: string, version: string) => {
	return `${version ? `${PREFIX_NAME}${version}:` : ''}${key}`;
};

const STORAGE_PERMISSION_ALLOW = (() => {
	if (IS_SERVER) return false;
	const test = 'test';
	try {
		window.localStorage.setItem(test, test);
		window.localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
})();

interface Options {
	session?: boolean;
}

export class Storage extends Cache {

	sessionStorage: MemoryStorage;

	localStorage: MemoryStorage;

	constructor() {
		super();
		this.sessionStorage = new MemoryStorage();
		this.localStorage = new MemoryStorage();
	}

	getInvoke(options?: Options) {
		return options?.session 
			? 'sessionStorage' 
			: 'localStorage';
	}

	setVersion(version: string) {
		super.setVersion(version);
		if (IS_SERVER) return;

		if (!STORAGE_PERMISSION_ALLOW) return;
		// 清除之前的缓存
		Object.keys(window.localStorage).forEach((item) => {
			if (
				item.includes(PREFIX_NAME) 
				&& !item.includes(`${PREFIX_NAME}${version}`)
			) {
				window.localStorage.removeItem(item);
			}
		});
	}

	/**
	 * 设置缓存
	 * @param {string} key 保存的键值
	 * @param {any} value 保存的内容
	 * @param {Options} options ~
	 * @returns {void} ~
	 */
	set(key: string, value: any, options?: Options): void {
		if (IS_SERVER) return;
		let invoke = this.getInvoke(options);

		key = formatKey(key, this.version);
		value = typeof value === 'string' ? value : JSON.stringify(value);

		try {
			window[invoke].setItem(key, value);
		} catch (error) {
			this[invoke].setItem(key, value);
			console.error(error);
		}
	}

	/**
	 * 获取缓存
	 * @param {string} key 保存的键值
	 * @param {Options} options ~
	 * @returns {any} ~
	 */
	get(key: string, options?: Options): any {
		if (IS_SERVER) return null;

		let invoke = this.getInvoke(options);
		key = formatKey(key, this.version);
		
		let value = this[invoke].getItem(key) || window[invoke].getItem(key);
		return flattenJSONParse(value);
	}

	/**
	 * 删除缓存
	 * @param {string} key 键值
	 * @param {Options} options ~
	 * @returns {void} ~
	 */
	remove(key: string, options?: Options): void {
		if (IS_SERVER) return;

		let invoke = this.getInvoke(options);
		
		this[invoke].removeItem(key); 
		window[invoke].removeItem(formatKey(key, this.version));
	}
}