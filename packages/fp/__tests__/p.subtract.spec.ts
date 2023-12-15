import * as FP from '@deot/helper-fp';

describe('subtract.ts', () => {
	it('basic', () => {
		const a = 2;
		const b = 1;
		expect(a - b).toBe(1);
		expect(FP.subtract(a, b)).toBe(1);
		expect(FP.subtract(b, a)).toBe(-1);
	});

	it('float', () => {
		const a = 0.11;
		const b = 0.1;
		expect(a - b).toBe(0.009999999999999995);
		expect(FP.subtract(a, b)).toBe(0.01);
		expect(FP.subtract(b, a)).toBe(-0.01);
	});
});
