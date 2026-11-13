import { flattenJSONParse } from '@deot/helper-utils';

export type QueryParser = boolean | ((v: string) => any);

/**
 * 取出查询串：第一个 `?` 之后、其后第一个 `#` 之前的内容
 * 只截断 `?` 之后的 `#`，因此 hash 路由（`/#/page?id=1`）中的参数仍可读取
 * @param url 完整地址或查询串
 * @param bare 没有 `?` 时是否把整串当作查询串
 * @returns ~
 */
export const extractSearch = (url: string, bare?: boolean) => {
	const index = url.indexOf('?');
	if (index === -1 && !bare) return '';

	const search = url.slice(index + 1);
	const hashIndex = search.indexOf('#');
	return hashIndex === -1 ? search : search.slice(0, hashIndex);
};

/**
 * 拆分查询串为 [key, value]（均未解码）
 * 只在第一个 `=` 处切分，值中的 `=` 会保留；没有 `=` 的参数值为 ''
 * @param search 查询串
 * @returns ~
 */
export const eachQuery = (search: string) => {
	const result: [string, string][] = [];
	search.split('&').forEach((segment) => {
		const index = segment.indexOf('=');
		const key = index === -1 ? segment : segment.slice(0, index);
		if (!key.trim()) return;

		result.push([key, index === -1 ? '' : segment.slice(index + 1)]);
	});
	return result;
};

/**
 * `false` 时不转换，函数时使用该函数，其余情况使用默认转换
 * @param parser 配置项
 * @returns ~
 */
export const resolveParser = (parser?: QueryParser) => {
	if (parser === false) return null;
	return typeof parser === 'function' ? parser : flattenJSONParse;
};
