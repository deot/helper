import { IS_SERVER } from '@deot/helper-shared';

export const hasClass = (el: HTMLElement, cls?: string) => {
	if (IS_SERVER || !cls) return false;

	if (cls.includes(' ')) {
		throw new Error('[@deot/helper-dom]: 类名不应该包含空格');
	}

	if (el.classList) {
		return el.classList.contains(cls);
	} else {
		return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}
};