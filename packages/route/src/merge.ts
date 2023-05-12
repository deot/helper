import { loopDecodeURIComponent } from './_helper';


interface Route {
	path?: string | string[];
	query?: {
		[key: string]: any;
	};
}

export const merge = (route: Route) => {
	const {
		path = '',
		query
	} = route;
	let result = path instanceof Array 
		? `/${path.join('/')}`
		: path;

	let queryArr: string[] = [];
	for (let key in query) {
		// 过滤掉值为null,undefined,''情况
		if (
			query[key] 
			|| query[key] === false 
			|| query[key] === 0
		) {
			let v = loopDecodeURIComponent(query[key]);
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