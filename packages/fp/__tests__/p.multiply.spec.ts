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
		expect(0.57 * 100).toBe(56.99999999999999);
		expect(FP.multiply(0.57, 100)).toBe(57);
	});

	it('float/e', () => {
		expect(FP.multiply(1.5e-7, 3)).toBe(4.5e-7);
		expect(FP.multiply(1.5e-7, 2)).toBe(3e-7);
	});

	it('curry', () => {
		expect(FP.multiply(3)(2)).toBe(6);
	});
});
