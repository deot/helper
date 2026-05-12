import { flatten } from './flatten';

/**
 * 格式转换
 * '1' -> 1
 * '{}' -> {}
 * '9007199254740992' -> '9007199254740992'
 * '9007199254740991' -> 9007199254740991
 * '1E1' -> '1E1'（整段为「整数+e/E+整数」时保留字符串，不做推断）
 * @param value 输入
 * @returns ~
 */
export const flattenJSONParse = (value: string | null): any => {
	if (value === null) return null;

	// `JSON.parse` 会当成科学计数数字，这里是按字面保留字符串
	if (/^-?\d+[eE]\d+$/.test(value)) return value;

	const regex = /^\d+$/;
	// 数字字符串长度超过17，JSON.parse()会将后面的数组变成0
	if (
		regex.test(value)
		&& value.length >= 16
		&& +value > Number.MAX_SAFE_INTEGER
	) {
		return value;
	}

	return flatten(value, JSON.parse, v => typeof v === 'object');
};
