/**
 * https://www.30secondsofcode.org/js/s/get-url-parameters/
 * https://www.30secondsofcode.org/js/s/query-string-to-object/
 */
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

	const [prefix, search] = url$.split('?');
	const query: { [key: string]: any } = {};

	if (search) {
		Array
			.from((search.match(/[^?=&]+=[^&]*/g) || []))
			.forEach((v: string) => {
				let [key, value] = v.split('=');
				value = loopDecodeURIComponent(value);
				query[key] = typeof options$.parse === 'function' 
					? options$.parse(value) 
					: value;
			});
	}

	const sIndex = prefix.indexOf('/');

	return {
		origin: (sIndex !== -1 ? prefix.slice(0, sIndex) : prefix) || '',
		path: prefix.slice(sIndex),
		query
	};
};