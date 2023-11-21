import { ACache } from './cache';

interface Options {
	// 时间：默认12小时、，单位：天
	days: number;
	// 域名下的路径：默认：/
	path?: string;
	// 域名
	domain?: string;
}

const ALLOW = (() => {
	try {
		document.cookie = 'test';
		return true;
	} catch {
		return false;
	}
})();

class CookieStore extends ACache {
	/**
	 * 设置cookie
	 * @param key 保存的键值
	 * @returns ~
	 */
	get(key: string): any {
		if (!ALLOW) return null;

		let r = new RegExp("(?:^|;+|\\s+)" + key + "=([^;]*)");
		let m = window.document.cookie.match(r);
		let value = !m ? null : decodeURIComponent(m[1]);

		return this.options.get!(value);
	}

	/**
	 * 设置缓存
	 * @param key 保存的键值
	 * @param value 保存的内容
	 * @param options ~
	 */
	set(key: string, value: any, options?: Options): void {
		if (!ALLOW) return;

		let { days, path, domain } = options || {}; 
		let expires = new Date();
		expires.setTime(expires.getTime() + (days ? 3600000 * 24 * days : 0.5 * 24 * 60 * 60 * 1000)); // 默认12小时

		value = this.options.set!(typeof value === 'string' ? value : JSON.stringify(value));
		// eslint-disable-next-line max-len
		document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toString()};path=${path || '/'};${domain ? `domain=${domain};` : ''}`;
	}

	/**
	 * 删除缓存
	 * @param key 键值
	 * @param options ~
	 */
	remove(key: string, options?: Options): void {
		if (!ALLOW) return;

		let { path, domain } = options || {}; 
		let expires = new Date(0);
		document.cookie = `${key}=;expires=${expires.toUTCString()};path=${(path || '/')};${domain ? `domain=${domain};` : ''}`;
	}
}

export const Cookie = new CookieStore();