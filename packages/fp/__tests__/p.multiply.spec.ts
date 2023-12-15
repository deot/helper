import * as FP from '@deot/helper-fp';

describe('multiply.ts', () => {
	it('basic', () => {
		const a = 1;
		const b = 2;
		expect(a * b).toBe(2);
		expect(FP.multiply(a, b)).toBe(2);
		expect(FP.multiply(b, a)).toBe(2);
	});
	it('float', () => {
		const a = 0.1;
		const b = 0.11;
		expect(a * b).toBe(0.011000000000000001);
		expect(FP.multiply(a, b)).toBe(0.011);
		expect(FP.multiply(b, a)).toBe(0.011);
	});
});
