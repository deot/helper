import { IS_SERVER } from './_constants';

const PREFIXES = ['webkit', 'Moz', 'ms', 'O'];

// 用到时才创建，避免模块加载即产生副作用
let $target: CSSStyleDeclaration | undefined;
// camelCase 属性名 -> 该属性在当前环境需要的前缀，'' 表示不需要
const cache = new Map<string, string>();

const toCamel = (v: string) => v.replace(/-+([a-zA-Z])/g, (_, c: string) => c.toUpperCase());
const toKebab = (v: string) => v.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const toPascal = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

const getPrefix = (camel: string) => {
	let prefix = cache.get(camel);
	if (prefix !== undefined) return prefix;

	$target = $target || document.createElement('div').style;

	prefix = '';
	// 标准属性优先；标准与前缀属性都不支持时也按标准属性返回
	if (!(camel in $target)) {
		const pascal = toPascal(camel);
		prefix = PREFIXES.find(v => (v + pascal) in $target!) || '';
	}

	cache.set(camel, prefix);
	return prefix;
};

/**
 * 逐个属性探测：当前环境支持标准属性时原样返回，否则返回带浏览器前缀的属性名
 * 入参可以是 camelCase 或 kebab-case；自定义属性(--*)及已带前缀的属性(-webkit-*)原样返回
 * @param v ~
 * @returns ~
 */
export const prefixStyle = (v: string) => {
	if (!v || v.charAt(0) === '-') {
		return {
			camel: v,
			kebab: v
		};
	}

	const camel = toCamel(v);
	const kebab = toKebab(camel);
	const prefix = IS_SERVER ? '' : getPrefix(camel);

	if (!prefix) {
		return { camel, kebab };
	}

	return {
		camel: prefix + toPascal(camel),
		kebab: `-${prefix.toLowerCase()}-${kebab}`
	};
};
