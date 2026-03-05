import { ACache } from './cache';
import { MemoryStorage } from './memory-storage';

const PREFIX_NAME = '@deot/helper/';
// Storage和Cookie不同，可以自定义key
const formatKey = (key: string, versions: Array<string | number | undefined>) => {
	const version = versions.filter(i => typeof i !== 'undefined')[0];
	return `${version ? `${PREFIX_NAME}${version}:` : ''}${key}`;
};

const ALLOW = (() => {
	const test = 'test';
	try {
		window.localStorage.setItem(test, test);
		window.localStorage.removeItem(test);
		return true;
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
		const versions = [version, ...keepVersions!];
		// 清除之前的缓存
		Object.keys(window.localStorage).forEach((item) => {
			/* istanbul ignore else -- @preserve */
			if (
				item.includes(PREFIX_NAME)
				&& !versions.some(i => item.includes(`${PREFIX_NAME}${i}`))
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
