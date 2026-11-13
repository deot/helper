// 非负整数，非法值（负数、NaN）归 0
const normalize = (value: number) => Math.max(0, Math.floor(value)) || 0;

// 中间4位 * 号加密
export const asterisk = (value: string, from?: number, length?: number) => {
	from = normalize(from ?? 3);
	length = normalize(length ?? 4);

	return value.substring(0, from) + '*'.repeat(length) + value.substring(from + length);
};
