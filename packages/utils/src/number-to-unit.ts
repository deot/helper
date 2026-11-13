/**
 * 为数字加上单位：万或亿
 *
 * 例如：
 *      1000.01 => 1000.01
 *      10000 => 1万
 *      99000 => 9.9万
 *      566000 => 56.6万
 *      5660000 => 566万
 *      44440000 => 4444万
 *      11111000 => 1111.1万
 *      99999999 => 1亿（四舍五入后满 10000 时进位到下一级单位）
 *      444400000 => 4.44亿
 *      1666000000000 => 1.67万亿
 *      -50000 => -5万
 *
 * 超过 Number.MAX_SAFE_INTEGER 的值按 Number.MAX_SAFE_INTEGER 处理（9007.2万亿）
 */

const getDigit = (integer: number) => {
	let digit = -1;
	while (integer >= 1) {
		digit++;
		integer /= 10;
	}
	return digit;
};

const round = (number: number, exponent: number, decimalDigit: number) => {
	return Math.round(number / Math.pow(10, exponent - decimalDigit)) / Math.pow(10, decimalDigit);
};

export const numberToUnit = (number: number, decimalDigit?: number): string | number => {
	if (number < 0) {
		const result = numberToUnit(-number, decimalDigit);
		return typeof result === 'number' ? -result : `-${result}`;
	}
	if (number > Number.MAX_SAFE_INTEGER) {
		number = Number.MAX_SAFE_INTEGER;
	}
	// 不足一万（含 NaN）原样返回
	if (!(number >= 10000)) return number;

	decimalDigit = decimalDigit == null ? 2 : decimalDigit;

	// ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
	// 每 4 位一级：4 -> 万，8 -> 亿，12 -> 万亿，16 -> 亿亿
	let exponent = Math.floor(getDigit(Math.floor(number)) / 4) * 4;
	let value = round(number, exponent, decimalDigit);
	if (value >= 10000) {
		exponent += 4;
		value = round(number, exponent, decimalDigit);
	}

	return value + (exponent % 8 ? '万' : '') + '亿'.repeat(Math.floor(exponent / 8));
};
