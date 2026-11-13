import { flatten } from './flatten';

// `JSON.parse` 会当成科学计数数字，这里是按字面保留字符串
const SCIENTIFIC_REGEX = /^-?\d+[eE]\d+$/;
const INTEGER_REGEX = /^-?\d+$/;

// 超出安全范围的整数，JSON.parse() 会丢失精度
const shouldKeep = (value: string) => {
	return SCIENTIFIC_REGEX.test(value)
		|| (INTEGER_REGEX.test(value) && !Number.isSafeInteger(+value));
};

// 每一层解析前都做保护，避免 '"9007199254740993"' 这类嵌套字符串在后续层丢失精度
const parse = (value: any) => {
	return typeof value === 'string' && shouldKeep(value) ? value : JSON.parse(value);
};

/**
 * 格式转换
 * '1' -> 1
 * '{}' -> {}
 * '9007199254740992' -> '9007199254740992'
 * '9007199254740991' -> 9007199254740991
 * '-9007199254740992' -> '-9007199254740992'
 * '"9007199254740992"' -> '9007199254740992'
 * '1E1' -> '1E1'（整段为「整数+e/E+整数」时保留字符串，不做推断）
 * @param value 输入
 * @returns ~
 */
export const flattenJSONParse = (value: string | null): any => {
	if (value === null) return null;

	return flatten(value, parse, v => typeof v === 'object');
};
