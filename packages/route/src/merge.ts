import { flatten } from '@deot/helper-utils';

export interface Route {
	origin?: string;
	path?: string | string[];
	query?: {
		[key: string]: any;
	};
}

export const merge = (route: Route) => {
	const {
		origin = '',
		path = '',
		query
	} = route;
	const query$ = query || {};

	let path$ = path instanceof Array
		? path.length
			? `/${path.join('/')}`
			: ''
		: path;

	// origin 与 path 之间保证只有一个 `/`
	if (origin && path$) {
		const hasSlash = origin.endsWith('/');
		if (hasSlash && path$.startsWith('/')) {
			path$ = path$.slice(1);
		} else if (!hasSlash && !/^[/?#]/.test(path$)) {
			path$ = `/${path$}`;
		}
	}

	const base = origin + path$;

	const queryArr: string[] = [];
	Object.keys(query$).forEach((key) => {
		const value = query$[key];
		// 过滤掉值为null,undefined,''情况
		if (value || value === false || value === 0) {
			// 对象与数组序列化为 JSON，与 parse 的默认转换对称
			const v = typeof value === 'object' ? JSON.stringify(value) : flatten(value);
			queryArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
		}
	});

	if (!queryArr.length) return base;

	// 普通锚点（`/a#top`）：参数插到 `#` 之前
	// hash 路由（`/#/page`、`/#!/page`、`/#/page?id=1`）：参数属于 `#` 之后的部分，追加在末尾
	const hashIndex = base.indexOf('#');
	const hash = hashIndex === -1 ? '' : base.slice(hashIndex);
	const isAnchor = !!hash && !hash.includes('?') && !/^#[/!]/.test(hash);

	const head = isAnchor ? base.slice(0, hashIndex) : base;
	const scope = isAnchor ? head : (hash || base);
	const separator = scope.includes('?')
		? (/[?&]$/.test(scope) ? '' : '&')
		: '?';

	return head + separator + queryArr.join('&') + (isAnchor ? hash : '');
};
