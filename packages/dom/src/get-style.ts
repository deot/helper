import { IS_SERVER } from './_constants';

export const getStyle = (el: Element, name?: string): string => {
	if (IS_SERVER || !name) return '';

	// 自定义属性(--*)不能按属性名索引，只能通过 getPropertyValue 读取
	const isVar = name.startsWith('--');
	if (name === 'float') {
		name = 'cssFloat';
	}

	const read = (style?: CSSStyleDeclaration | null) => {
		return (isVar ? style?.getPropertyValue(name).trim() : style?.[name]) || '';
	};

	// 非 HTML/SVG 元素（或被误传的非元素节点）没有 style
	const inline = read((el as HTMLElement).style);
	if (inline) return inline;

	try {
		return read((document.defaultView as any).getComputedStyle(el, ''));
	} catch {
		return '';
	}
};
