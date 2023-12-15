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
});
