import { IS_SERVER } from './_constants';
import { applyAttrs, load } from './_utils';
import type { LoadAttrs } from './_utils';

export interface LoadLinkOptions {
	attrs?: LoadAttrs;
}

export const link = (src: string, options?: LoadLinkOptions): Promise<1> | undefined => {
	if (IS_SERVER) return;

	return load(link.cache, 'link', src, (resolve, reject) => {
		const el = document.createElement('link');
		el.rel = 'stylesheet';
		applyAttrs(el, options?.attrs);

		el.onload = () => resolve(1);
		el.onerror = (e) => {
			el.remove();
			reject(e);
		};
		el.href = src;

		document.head.appendChild(el);
	});
};

link.cache = new Map<string, Promise<1>>();
