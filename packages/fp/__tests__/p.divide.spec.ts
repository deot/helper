import * as FP from '@deot/helper-fp';

describe('divide.ts', () => {
	it('basic', () => {
		const a = 1;
		const b = 2;
		expect(a / b).toBe(0.5);
		expect(FP.divide(a, b)).toBe(0.5);
		expect(FP.divide(b, a)).toBe(2);
	});
	it('float', () => {
		const a = 0.1;
		const b = 0.11;
		expect(a / b).toBe(0.9090909090909092);
		expect(b / a).toBe(1.0999999999999999);
		expect(FP.divide(a, b)).toBe(0.9090909090909092);
		expect(FP.divide(b, a)).toBe(1.1);
	});
});
