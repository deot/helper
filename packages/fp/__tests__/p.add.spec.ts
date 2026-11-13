import * as FP from '@deot/helper-fp';

describe('add.ts', () => {
	it('basic', () => {
		const a = 1;
		const b = 2;
		expect(a + b).toBe(3);
		expect(FP.add(a, b)).toBe(3);
		expect(FP.add(b, a)).toBe(3);
	});
	it('float', () => {
		const a = 0.1;
		const b = 0.11;
		expect(a + b).toBe(0.21000000000000002);
		expect(FP.add(a, b)).toBe(0.21);
		expect(FP.add(b, a)).toBe(0.21);
		expect(FP.add(0.1, 0.2)).toBe(0.3);
		expect(FP.add(-0.1, -0.2)).toBe(-0.3);
	});

	it('float/e', () => {
		expect(FP.add(1.5e-7, 1)).toBe(1.00000015);
		expect(FP.add(1e-7, 2e-7)).toBe(3e-7);
		expect(FP.add(1e21, 1)).toBe(1e21);
	});

	it('null / string / NaN', () => {
		expect(FP.add(null as any, 2)).toBe(2);
		expect(FP.add('0.1' as any, '0.2' as any)).toBe(0.3);
		expect(FP.add(undefined as any, 2)).toBe(NaN);
		expect(FP.add(Infinity, 2)).toBe(Infinity);
	});

	it('curry', () => {
		const add1 = FP.add(1);

		expect(add1(2)).toBe(3);
		expect([1, 2, 3].map(i => add1(i))).toEqual([2, 3, 4]);

		expectTypeOf(add1(2)).toEqualTypeOf<number>();
		expectTypeOf(FP.add(1, 2)).toEqualTypeOf<number>();
	});
});
