import { IS_SERVER } from '@deot/helper-shared';

export const setStyle = (el: HTMLElement, name: object | string, value: any) => {
	if (IS_SERVER || !name) return;

	if (typeof name === 'object') {
		for (let prop in name) {
			if (Object.hasOwnProperty.call(name, prop)) {
				setStyle(el, prop, name[prop]);
			}
		}
	} else {
		el.style[name] = value;
	}
};