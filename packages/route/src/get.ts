import { flatten } from '@deot/helper-utils';
import { extractSearch, eachQuery, resolveParser } from './query';
import type { QueryParser } from './query';

export interface GetOptions {
	url?: string;
	parse?: QueryParser;
}

export const get = <T = any>(
	key: string,
	url?: string | GetOptions,
	options?: GetOptions
): T | null => {
	const options$ = {
		...(typeof url === 'object' ? url : { url }),
		...options
	};

	const url$ = options$.url || (typeof window === 'undefined' ? '' : window.location.search);
	const parser = resolveParser(options$.parse);

	// 重复的 key 取第一个；key 同时按原文与解码后比较
	const match = eachQuery(extractSearch(url$, true))
		.find(([k]) => k === key || flatten(k) === key);

	if (!match) return null;
	const value = flatten(match[1]);

	return parser ? parser(value) : value;
};
