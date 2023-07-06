import { IS_SERVER } from './_constants';
import { hasClass } from './has-class';

export const addClass = (el: HTMLElement, cls?: string) => {
	if (IS_SERVER || !cls) return;

	let curClass = el.className;
	let classes = cls.split(' ');

	for (let i = 0, j = classes.length; i < j; i++) {
		let clsName = classes[i];
		if (clsName) {
			if (el.classList) {
				el.classList.add(clsName);
			} else if (!hasClass(el, clsName)) {
				curClass += ' ' + clsName;
			}
		}
	}

	if (!el.classList) {
		el.className = curClass;
	}
};