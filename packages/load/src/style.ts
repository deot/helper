import { IS_SERVER } from './_constants';

interface LoadStyleCodeOptions {
	id?: string | HTMLElement;
}

export const style = (value: string, options?: LoadStyleCodeOptions) => {
	if (IS_SERVER) return;

	if (options?.id) {
		const el = typeof options.id === 'string'
			? document.getElementById(options.id)
			: options.id;

		if (el) {
			el.innerHTML = value;
			return;
		}
	}

	if (style.cache.has(value)) return;
	style.cache.add(value);

	const el = document.createElement('style');

	/* istanbul ignore else -- @preserve */
	if (options?.id && typeof options.id === 'string') {
		el.setAttribute('id', options.id);
	}

	el.innerHTML = value;

	document.getElementsByTagName('head')[0].appendChild(el);
};

export const removeStyle = (id: string | HTMLElement) => {
	if (IS_SERVER) return;

	if (id) {
		const el = typeof id === 'string'
			? document.getElementById(id)
			: id;

		if (!el) return;

		const code = el.innerHTML;
		document.getElementsByTagName('head')[0].removeChild(el);

		if (style.cache.has(code)) {
			style.cache.delete(code);
		}
	}
};

style.cache = new Set();
