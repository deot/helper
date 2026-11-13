import { ACache } from './cache';
import { MemoryStorage } from './memory-storage';

const PREFIX_NAME = '@deot/helper/';
// Storage和Cookie不同，可以自定义key
const formatKey = (key: string, versions: Array<string | number | undefined>) => {
	const version = versions.filter(i => typeof i !== 'undefined')[0];
	return `${version ? `${PREFIX_NAME}${version}:` : ''}${key}`;
};

// 只判断能否访问，不做写入探测：
// 1. 不占用、不误删业务自己的key
// 2. 容量已满时仍可读取已有数据，写入失败由`set`回退到内存
const ALLOW = (() => {
	try {
		return !!window.localStorage && !!window.sessionStorage;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return false;
	}
})();

interface Options {
	session?: boolean;
	version?: string | number;
}

class StorageStore extends ACache {
	sessionStorage = new MemoryStorage();

	localStorage = new MemoryStorage();

	getInvoke(options?: Options) {
		return options?.session
			? 'sessionStorage'
			: 'localStorage';
	}

	configure(options: ACache['options']) {
		super.configure(options);

		if (!ALLOW) return;

		const { version, versions: keepVersions } = this.options;
		// 未设置版本时不清理
		if (!version) return;

		const versions = [version, ...keepVersions!];
		// 清除之前的缓存，带上分隔符精确匹配，避免版本`1`保留`12:`、`1.1:`
		Object.keys(window.localStorage).forEach((item) => {
			/* istanbul ignore else -- @preserve */
			if (
				item.startsWith(PREFIX_NAME)
				&& !versions.some(i => item.startsWith(`${PREFIX_NAME}${i}:`))
			) {
				window.localStorage.removeItem(item);
			}
		});
	}

	/**
	 * 设置缓存
	 * @param key 保存的键值
	 * @param value 保存的内容
	 * @param options ~
	 */
	set(key: string, value: any, options?: Options): void {
		if (!ALLOW) return;
		const invoke = this.getInvoke(options);

		key = formatKey(key, [options?.version, this.options.version]);
		value = this.options.set!(typeof value === 'string' ? value : JSON.stringify(value));

		try {
			window[invoke].setItem(key, value);
			// 写入成功后清掉内存中的旧值，否则`get`会优先读到它
			this[invoke].removeItem(key);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			this[invoke].setItem(key, value);
		}
	}

	/**
	 * 获取缓存
	 * @param key 保存的键值
	 * @param options ~
	 * @returns ~
	 */
	get(key: string, options?: Options): any {
		if (!ALLOW) return null;

		const invoke = this.getInvoke(options);
		key = formatKey(key, [options?.version, this.options.version]);

		const value = this[invoke].getItem(key) || window[invoke].getItem(key);
		return this.options.get!(value);
	}

	/**
	 * 删除缓存
	 * @param key 键值
	 * @param options ~
	 */
	remove(key: string, options?: Options): void {
		if (!ALLOW) return;

		const invoke = this.getInvoke(options);
		key = formatKey(key, [options?.version, this.options.version]);

		this[invoke].removeItem(key);
		window[invoke].removeItem(key);
	}
}

export const Storage = new StorageStore();
