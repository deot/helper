import { ACache } from './cache';

interface Options {
	// 时间：默认12小时、，单位：天
	days?: number;
	// 域名下的路径：默认：/
	path?: string;
	// 域名
	domain?: string;
}

// 只读探测，避免模块加载时写入多余的cookie
const ALLOW = (() => {
	try {
		return typeof document.cookie === 'string';
	} catch (_) {
		return false;
	}
})();

// key可能含有正则元字符，如`a.b`、`user[id]`
const escapeRegExp = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 其他来源写入的值可能不是合法的URI编码，如`100%`
const decode = (v: string) => {
	try {
		return decodeURIComponent(v);
	} catch {
		return v;
	}
};

class CookieStore extends ACache {
	/**
	 * 设置cookie
	 * @param key 保存的键值
	 * @returns ~
	 */
	get(key: string): any {
		if (!ALLOW) return null;

		const r = new RegExp('(?:^|;+|\\s+)' + escapeRegExp(key) + '=([^;]*)');
		const m = window.document.cookie.match(r);
		const value = !m ? null : decode(m[1]);

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

		const { days, path, domain } = options || {};
		const expires = new Date();
		expires.setTime(expires.getTime() + (days ? 3600000 * 24 * days : 0.5 * 24 * 60 * 60 * 1000)); // 默认12小时

		value = this.options.set!(typeof value === 'string' ? value : JSON.stringify(value));

		document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path || '/'};${domain ? `domain=${domain};` : ''}`;
	}

	/**
	 * 删除缓存
	 * @param key 键值
	 * @param options ~
	 */
	remove(key: string, options?: Options): void {
		if (!ALLOW) return;

		const { path, domain } = options || {};
		const expires = new Date(0);
		document.cookie = `${key}=;expires=${expires.toUTCString()};path=${(path || '/')};${domain ? `domain=${domain};` : ''}`;
	}
}

export const Cookie = new CookieStore();
