import { flatten, hasOwn } from '@deot/helper-utils';
import { extractSearch, eachQuery, resolveParser } from './query';
import type { QueryParser } from './query';

export interface ParseOptions {
	url?: string;
	parse?: QueryParser;
}

export interface ParsedRoute {
	origin: string;
	path: string;
	query: {
		[key: string]: any;
	};
}

export const parse = (url?: string | ParseOptions, options?: ParseOptions): ParsedRoute => {
	const options$ = {
		...(typeof url === 'object' ? url : { url }),
		...options
	};

	const url$ = options$.url || (typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`);
	const parser = resolveParser(options$.parse);

	const index = url$.indexOf('?');
	const prefix = index === -1 ? url$ : url$.slice(0, index);
	const query: { [key: string]: any } = {};

	eachQuery(extractSearch(url$)).forEach(([k, v]) => {
		const key = flatten(k);
		// 重复的 key 取第一个，与 get 保持一致
		if (hasOwn(query, key)) return;

		const value = flatten(v);
		// 不直接赋值，避免 `__proto__` 改写 query 的原型
		Object.defineProperty(query, key, {
			value: parser ? parser(value) : value,
			enumerable: true,
			writable: true,
			configurable: true
		});
	});

	const pIndex = prefix.indexOf('://');
	const sIndex = prefix.indexOf('/', pIndex === -1 ? 0 : pIndex + 3);
	return {
		origin: (sIndex !== -1 ? prefix.slice(0, sIndex) : prefix) || '',
		path: sIndex !== -1 ? prefix.slice(sIndex) : '',
		query
	};
};
