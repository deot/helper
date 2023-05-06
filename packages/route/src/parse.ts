import { IS_SERVER } from '@deot/helper-shared';
import { loopParse, loopDecodeURIComponent } from './_helper';

interface ParseOptions {
	url?: string;
	parse?: boolean | ((v: string) => any);
}
export const parse = (url?: string | ParseOptions, options?: ParseOptions) => {
	const options$ = {
		parse: loopParse,
		...(typeof url === 'object' ? url : { url }),
		...options
	};

	/* istanbul ignore next */
	const url$ = options$.url || (IS_SERVER ? '' : `${window.location.pathname}${window.location.search}`);

	let path: string[] = [];
	const query: { [key: string]: any } = {};
	const urlArr = url$.split('?');
	path = urlArr[0].split('/');

	if (urlArr.length > 1) {
		urlArr[1].split('&').forEach(str => {
			const arr = str.split('=');
			const key = arr[0];
			const value = loopDecodeURIComponent(arr[1]);
			query[key] = typeof options$.parse === 'function' 
				? options$.parse(value) 
				: value;
		});
	}

	return {
		path,
		query
	};
};