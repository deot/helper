import { IS_SERVER } from '@deot/helper-shared';
import { loopParse, loopDecodeURIComponent } from './_helper';

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
		parse: loopParse,
		...(typeof url === 'object' ? url : { url }),
		...options
	};
	/* istanbul ignore next */
	const url$ = options$.url || (IS_SERVER ? '' : window.location.search);

	const match = url$
		.substring(url$.indexOf('?') + 1)
		.match(new RegExp("(^|&)" + key + "=([^&]*)"));

	let value = match != null ? match[2] : null;

	if (value === null) return null;
	value = loopDecodeURIComponent(value);

	return typeof options$.parse === 'function' 
		? options$.parse(value) 
		: value;
};