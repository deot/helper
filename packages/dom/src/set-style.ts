import { IS_SERVER } from './_constants';

export const setStyle = (el: HTMLElement | SVGElement, name?: object | string, value?: any) => {
	if (IS_SERVER || !name) return;

	if (typeof name === 'object') {
		for (const prop in name) {
			/* istanbul ignore if -- @preserve */
			if (Object.hasOwnProperty.call(name, prop)) {
				setStyle(el, prop, name[prop]);
			}
		}
	} else if (name.startsWith('--')) {
		// 自定义属性(--*)按属性名赋值不生效，只能通过 setProperty 写入；空值即移除
		el.style.setProperty(name, value == null ? '' : String(value));
	} else {
		el.style[name] = value;
	}
};
