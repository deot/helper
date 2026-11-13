import { IS_SERVER } from './_constants';
import { applyAttrs, load } from './_utils';
import type { LoadAttrs } from './_utils';

export interface LoadScriptOptions {
	async?: boolean;
	attrs?: LoadAttrs;
}

export const script = (src: string, options?: LoadScriptOptions): Promise<1> | undefined => {
	if (IS_SERVER) return;

	return load(script.cache, 'script', src, (resolve, reject) => {
		const el = document.createElement('script');
		applyAttrs(el, options?.attrs);

		if (options?.async === false) {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', src, false); // Deprecation
			xhr.send();

			const { status } = xhr;
			if (!((status >= 200 && status < 300) || status === 304)) {
				return reject(new Error(`HTTP ${status}`));
			}

			el.text = xhr.responseText;
			document.head.appendChild(el);
			return resolve(1);
		}

		el.onload = () => resolve(1);
		el.onerror = (e) => {
			el.remove();
			reject(e);
		};
		el.src = src;

		document.head.appendChild(el);
	});
};

script.cache = new Map<string, Promise<1>>();
