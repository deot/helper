import * as FP from '@deot/helper-fp';

describe('divide.ts', () => {
	it('basic', () => {
		const a = 1;
		const b = 2;
		expect(a / b).toBe(0.5);
		expect(FP.divide(a, b)).toBe(0.5);
		expect(FP.divide(b, a)).toBe(2);
	});
	it('null', () => {
		const a = null as any;
		const b = 2;
		expect(a / b).toBe(0);
		expect(FP.divide(a, b)).toBe(0);
		expect(FP.divide(b, a)).toBe(Infinity);
	});
	it('float/1', () => {
		const a = 0.1;
		const b = 0.11;
		expect(a / b).toBe(0.9090909090909092);
		expect(b / a).toBe(1.0999999999999999);
		// Decimal.div(0.1, 0.11).valueOf() => 0.9090909090909091
		expect(FP.divide(a, b)).toBe(0.9090909090909091);
		expect(FP.divide(b, a)).toBe(1.1);
	});

	it('float/2', () => {
		const a = 0.2;
		const b = 0.11;
		expect(a / b).toBe(1.8181818181818183);
		expect(b / a).toBe(0.5499999999999999);
		// Decimal.div(0.2, 0.11).valueOf() => 1.8181818181818181818
		expect(FP.divide(a, b)).toBe(Number('1.8181818181818181818'));
		expect(FP.divide(b, a)).toBe(0.55);
	});

	it('float/3', () => {
		const a = 2.64;
		const b = 100;
		expect(a / b).toBe(0.0264);
		expect(FP.divide(a, b)).toBe(0.0264);
	});

	it('float/e', () => {
		const a = 5e-7;
		const b = 0.13;
		expect(a / b).toBe(0.000003846153846153846);
		// Decimal.div(5e-7, 0.13).valueOf() => 0.000003846153846153846
		expect(FP.divide(a, b)).toBe(Number('0.0000038461538461538461538'));
	});

	it('float/4', () => {
		// 缩放时不能用浮点乘法：0.57 * 100 = 56.99999999999999
		expect(0.57 / 0.01).toBe(56.99999999999999);
		expect(FP.divide(0.57, 0.01)).toBe(57);
		expect(1.15 / 0.05).toBe(22.999999999999996);
		expect(FP.divide(1.15, 0.05)).toBe(23);
	});

	it('curry', () => {
		expect(FP.divide(6)(2)).toBe(3);
	});
});
