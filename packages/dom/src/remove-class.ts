import { IS_SERVER } from './_constants';
import { hasClass } from './has-class';

export const removeClass = (el: Element, cls?: string) => {
	if (IS_SERVER || !cls) return;

	const classes = cls.split(/\s+/);
	let curClass = ' ' + el.className + ' ';

	for (let i = 0, j = classes.length; i < j; i++) {
		const clsName = classes[i];
		if (clsName) {
			if (el.classList) {
				el.classList.remove(clsName);

				continue;
			}
			/* istanbul ignore next -- @preserve */
			if (hasClass(el, clsName)) {
				curClass = curClass.replace(' ' + clsName + ' ', ' ');
			}
		}
	}
	if (!el.classList) {
		el.className = curClass.trim();
	}
};
