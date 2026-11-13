import * as Utils from '@deot/helper-utils';

describe('number-to-unit.ts', () => {
	it('basic', () => {
		expect(Utils.numberToUnit(10)).toBe(10);
		expect(Utils.numberToUnit(1000000)).toBe('100万');
		expect(Utils.numberToUnit(100000000)).toBe('1亿');
		expect(Utils.numberToUnit(1666000000000, 4)).toBe('1.666万亿');
		expect(Utils.numberToUnit(Number.MAX_SAFE_INTEGER + 1)).toBe('9007.2万亿');
		expect(Utils.numberToUnit(Number.MAX_SAFE_INTEGER)).toBe('9007.2万亿');
	});

	it('不足一万原样返回', () => {
		expect(Utils.numberToUnit(0)).toBe(0);
		expect(Utils.numberToUnit(1000.01)).toBe(1000.01);
		expect(Utils.numberToUnit(9999.999)).toBe(9999.999);
		expect(Utils.numberToUnit(NaN)).toBe(NaN);
	});

	it('万 / 亿 / 万亿', () => {
		expect(Utils.numberToUnit(10000)).toBe('1万');
		expect(Utils.numberToUnit(99000)).toBe('9.9万');
		expect(Utils.numberToUnit(566000)).toBe('56.6万');
		expect(Utils.numberToUnit(5660000)).toBe('566万');
		expect(Utils.numberToUnit(44440000)).toBe('4444万');
		expect(Utils.numberToUnit(11111000)).toBe('1111.1万');
		expect(Utils.numberToUnit(444400000)).toBe('4.44亿');
		expect(Utils.numberToUnit(950000000000)).toBe('9500亿');
		expect(Utils.numberToUnit(1666000000000)).toBe('1.67万亿');
		expect(Utils.numberToUnit(Infinity)).toBe('9007.2万亿');
	});

	it('四舍五入后进位到下一级单位', () => {
		expect(Utils.numberToUnit(99999)).toBe('10万');
		expect(Utils.numberToUnit(99994999)).toBe('9999.5万');
		expect(Utils.numberToUnit(99999999)).toBe('1亿');
		expect(Utils.numberToUnit(999960000000)).toBe('9999.6亿');
		expect(Utils.numberToUnit(999999999999)).toBe('1万亿');
		expect(Utils.numberToUnit(99999999, 0)).toBe('1亿');
	});

	it('decimalDigit', () => {
		expect(Utils.numberToUnit(12345678, 0)).toBe('1235万');
		expect(Utils.numberToUnit(12345678, 1)).toBe('1234.6万');
		expect(Utils.numberToUnit(12345678, 4)).toBe('1234.5678万');
	});

	it('负数', () => {
		expect(Utils.numberToUnit(-10)).toBe(-10);
		expect(Utils.numberToUnit(-50000)).toBe('-5万');
		expect(Utils.numberToUnit(-444400000)).toBe('-4.44亿');
		expect(Utils.numberToUnit(-Infinity)).toBe('-9007.2万亿');
	});
});
