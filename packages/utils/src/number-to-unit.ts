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
 *      444400000 => 4.44亿
 *      40000000,00000000,00000000 => 4000万亿亿
 *      4,00000000,00000000,00000000 => 4亿亿亿
 *
 */

const getDigit = (integer: number) => {
	let digit = -1;
	while (integer >= 1) {
		digit++;
		integer /= 10;
	}
	return digit;
};

const addWan = (integer: number, num: number, mutiple: number, decimalDigit: number) => {
	const digit = getDigit(integer);
	if (digit > 3) {
		let remainder = digit % 8;
		if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’
			remainder = 4;
		}
		return Math.round(num / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + '万'; // eslint-disable-line
	} else {
		return Math.round(num / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + ''; // eslint-disable-line
	}
};

export const numberToUnit = (number: number, decimalDigit?: number) => {
	if (number > Number.MAX_SAFE_INTEGER) {
		number = Number.MAX_SAFE_INTEGER;
	}
	decimalDigit = decimalDigit == null ? 2 : decimalDigit;
	const integer = Math.floor(number);
	const digit = getDigit(integer);
	// ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
	const unit: string[] = [];
	if (digit > 3) {
		const multiple = Math.floor(digit / 8);
		if (multiple >= 1) {
			let tmp = Math.round(integer / Math.pow(10, 8 * multiple)); // eslint-disable-line
			unit.push(addWan(tmp, number, 8 * multiple, decimalDigit));
			for (let i = 0; i < multiple; i++) {
				unit.push('亿');
			}
			return unit.join('');
		} else {
			return addWan(integer, number, 0, decimalDigit);
		}
	} else {
		return number;
	}
};
