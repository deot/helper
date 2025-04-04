/**
 * https://www.30secondsofcode.org/js/s/get-url-parameters/
 * https://www.30secondsofcode.org/js/s/query-string-to-object/
 */
import { flattenJSONParse, flatten } from '@deot/helper-utils';

interface ParseOptions {
	url?: string;
	parse?: boolean | ((v: string) => any);
}
export const parse = (url?: string | ParseOptions, options?: ParseOptions) => {
	const options$ = {
		parse: flattenJSONParse,
		...(typeof url === 'object' ? url : { url }),
		...options
	};

	const url$ = options$.url || (typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`);

	const [prefix, search] = url$.split('?');
	const query: { [key: string]: any } = {};

	if (search) {
		Array
			.from((search.match(/[^?=&]+=[^&]*/g) || []))
			.forEach((v: string) => {
				const [key, value] = v.split('=');
				const value$ = flatten(value);
				query[key] = typeof options$.parse === 'function'
					? options$.parse(value$)
					: value$;
			});
	}

	const pIndex = prefix.indexOf('://');
	const sIndex = prefix.indexOf('/', pIndex === -1 ? 0 : pIndex + 3);
	return {
		origin: (sIndex !== -1 ? prefix.slice(0, sIndex) : prefix) || '',
		path: sIndex !== -1 ? prefix.slice(sIndex) : '',
		query
	};
};
