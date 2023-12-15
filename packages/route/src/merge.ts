import { flatten } from '@deot/helper-utils';

interface Route {
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
	let result = origin;
	result += path instanceof Array
		? path.length
			? `/${path.join('/')}`
			: ''
		: path;

	let queryArr: string[] = [];
	for (const key in query) {
		// 过滤掉值为null,undefined,''情况
		if (
			query[key]
			|| query[key] === false
			|| query[key] === 0
		) {
			const v = flatten(query[key]);
			queryArr = [
				...queryArr,
				`${key}=${encodeURIComponent(v)}`
			];
		}
	}

	if (queryArr.length > 0) {
		result += (result.indexOf('?') > -1 ? '&' : '?') + queryArr.join('&');
	}
	return result;
};
