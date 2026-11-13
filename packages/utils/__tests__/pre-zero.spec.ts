import * as Utils from '@deot/helper-utils';

describe('pre-zero.ts', () => {
	it('basic', () => {
		expect(Utils.preZero(1)).toBe('01');
		expect(Utils.preZero(0)).toBe('00');
		expect(Utils.preZero(10)).toBe('10');
		expect(Utils.preZero(9)).toBe('09');
		expect(Utils.preZero(100)).toBe('100');
	});

	it('负数保留符号', () => {
		expect(Utils.preZero(-5)).toBe('-05');
		expect(Utils.preZero(-10)).toBe('-10');
		expect(Utils.preZero(-0)).toBe('00');
	});
});
