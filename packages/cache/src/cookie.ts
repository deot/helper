import { IS_SERVER } from '@deot/helper-shared';
import { flattenJSONParse } from '@deot/helper-utils';
import { Cache } from './cache';

interface Options {
	// 时间：默认12小时、，单位：天
	days: number;
	// 域名下的路径：默认：/
	path?: string;
	// 域名
	domain?: string;
}

export class Cookie extends Cache {
	/**
	 * 设置cookie
	 * @param {string} key 保存的键值
	 * @returns {any} ~
	 */
	get(key: string): any {
		if (IS_SERVER) return null;

		let r = new RegExp("(?:^|;+|\\s+)" + key + "=([^;]*)");
		let m = window.document.cookie.match(r);
		let value = !m ? null : decodeURIComponent(m[1]);

		return flattenJSONParse(value);
	}

	/**
	 * 设置缓存
	 * @param {string} key 保存的键值
	 * @param {any} value 保存的内容
	 * @param {Options} options ~
	 * @returns {void} ~
	 */
	set(key: string, value: any, options: Options): void {
		if (IS_SERVER) return;

		let { days, path, domain } = options || {}; 
		let expire = new Date();
		expire.setTime(expire.getTime() + (days ? 3600000 * 24 * days : 0.5 * 24 * 60 * 60 * 1000)); // 默认12小时

		value = typeof value === 'string' ? value : JSON.stringify(value);
		// eslint-disable-next-line max-len
		document.cookie = `${key}=${encodeURIComponent(value)};expires=${expire.toString()};path=${path || '/'};${domain ? `domain=${domain};` : ''}`;
	}

	/**
	 * 删除缓存
	 * @param {string} key 键值
	 * @param {Options} options ~
	 * @returns {void} ~
	 */
	remove(key: string, options: Options): void {
		if (IS_SERVER) return;

		let { path, domain } = options || {}; 
		let expires = new Date(0);
		document.cookie = `${key}=;expires=${expires.toUTCString()};path=${(path || '/')};${domain ? `domain=${domain};` : ''}`;
	}
}