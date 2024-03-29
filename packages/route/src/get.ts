import { flattenJSONParse, flatten } from '@deot/helper-utils';

interface GetOptions {
	url?: string;
	parse?: boolean | ((v: string) => any);
}

export const get = (
	key: string,
	url?: string | GetOptions,
	options?: GetOptions
) => {
	const options$ = {
		parse: flattenJSONParse,
		...(typeof url === 'object' ? url : { url }),
		...options
	};

	const url$ = options$.url || (typeof window === 'undefined' ? '' : window.location.search);

	const match = url$
		.substring(url$.indexOf('?') + 1)
		.match(new RegExp('(^|&)' + key + '=([^&]*)'));

	let value = match != null ? match[2] : null;

	if (value === null) return null;
	value = flatten(value);

	return typeof options$.parse === 'function'
		? options$.parse(value as string)
		: value;
};
