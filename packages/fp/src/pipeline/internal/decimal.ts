export interface Decimal {
	// 去掉小数点后的整数
	int: number;
	// 小数位数
	scale: number;
}

/**
 * 把数字拆成整数与小数位数，用于整数运算，规避浮点误差
 * - 先用Number归一：null -> 0，数字字符串可用
 * - 处理科学计数法：1.5e-7 -> { int: 15, scale: 8 }
 * @param value ~
 * @returns ~
 */
export const toDecimal = (value: any): Decimal => {
	const n = Number(value);
	if (!Number.isFinite(n)) return { int: n, scale: 0 };

	let s = String(n);
	if (s.includes('e')) {
		const [mantissa, exponent] = s.split('e');
		const digits = (mantissa.split('.')[1] || '').length;
		const scale = digits - Number(exponent);

		// 指数为正时（如1e21）没有小数部分
		if (scale <= 0) return { int: n, scale: 0 };
		s = n.toFixed(Math.min(100, scale));
	}

	const [integer, fraction = ''] = s.split('.');
	return {
		int: Number(integer + fraction),
		scale: fraction.length
	};
};

/**
 * 对齐两个数的小数位数，返回放大后的整数
 * @param arg1 ~
 * @param arg2 ~
 * @returns ~
 */
export const align = (arg1: any, arg2: any) => {
	const d1 = toDecimal(arg1);
	const d2 = toDecimal(arg2);
	const scale = Math.max(d1.scale, d2.scale);

	return {
		int1: d1.int * (10 ** (scale - d1.scale)),
		int2: d2.int * (10 ** (scale - d2.scale)),
		scale
	};
};
