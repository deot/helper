import { IS_SERVER } from './_constants';

export interface LoadStyleCodeOptions {
	id?: string | HTMLElement;
}

const getElement = (id?: string | HTMLElement) => {
	return typeof id === 'string' ? document.getElementById(id) : id;
};

export const style = (value: string, options?: LoadStyleCodeOptions): void => {
	if (IS_SERVER) return;

	const id = options?.id;
	const current = getElement(id);

	if (current) {
		const code = current.textContent || '';
		if (code !== value) {
			// 旧内容已不在文档中，不清理会导致之后同样的 code 无法再注入
			style.cache.delete(code);
			current.textContent = value;
		}
		return;
	}

	// 指定了 id 时以 id 为准，仅未指定时才按 code 去重
	if (!id && style.cache.has(value)) return;
	style.cache.add(value);

	const el = document.createElement('style');
	if (id) {
		el.setAttribute('id', id as string);
	}

	el.textContent = value;

	document.head.appendChild(el);
};

export const removeStyle = (id: string | HTMLElement): void => {
	if (IS_SERVER) return;

	const el = getElement(id);
	if (!el) return;

	style.cache.delete(el.textContent || '');
	el.remove();
};

style.cache = new Set<string>();
