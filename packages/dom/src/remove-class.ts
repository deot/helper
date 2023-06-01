import { IS_SERVER } from '@deot/helper-shared';
import { hasClass } from './has-class';

export const removeClass = (el: HTMLElement, cls: string) => {
	if (IS_SERVER) return;

	let classes = cls.split(' ');
	let curClass = ' ' + el.className + ' ';

	for (let i = 0, j = classes.length; i < j; i++) {
		let clsName = classes[i];
		if (clsName) {
			if (el.classList) {
				el.classList.remove(clsName);
			} else if (hasClass(el, clsName)) {
				curClass = curClass.replace(' ' + clsName + ' ', ' ');
			}
		}
	}
	if (!el.classList) {
		el.className = curClass.trim();
	}
};