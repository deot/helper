import { IS_SERVER } from '@deot/helper-shared';

export const getStyle = (el: HTMLElement, name?: string) => {
	if (IS_SERVER || !name) return '';

	if (name === 'float') {
		name = 'cssFloat';
	}

	try {
		let computed = (document.defaultView as any).getComputedStyle(el, '');
		return el.style[name] || (computed?.[name] || '');
	} catch (e) {
		return el.style[name] || '';
	}
};