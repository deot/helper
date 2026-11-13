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
		expect(FP.subtract(0.3, 0.1)).toBe(0.2);
		expect(FP.subtract(1.1, 1)).toBe(0.1);
	});

	it('float/e', () => {
		expect(FP.subtract(1, 1.5e-7)).toBe(0.99999985);
		expect(FP.subtract(3e-7, 1e-7)).toBe(2e-7);
	});

	it('curry', () => {
		expect(FP.subtract(3)(1)).toBe(2);
	});
});
