import * as FP from '@deot/helper-fp';

const { map } = FP; // 同ramda api，不同于loadsh（第一个参数为值）
describe('map.ts', () => {
	it('array', () => {
		const fn = map((x: number) => x * x);

		expect(fn([1, 2, 3])).toEqual([1, 4, 9]);
	});

	it('object', () => {
		const fn = map((x: number) => x * x);

		expect(fn({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 4, c: 9 });
	});

	it('deep object', () => {
		const fn = map((x: number) => x * x);

		expect(fn({ d: { a: 1 } })).toEqual({ d: NaN });
	});

	it('types', () => {
		const fn = map((x: number) => String(x));

		expectTypeOf(fn([1, 2, 3])).toEqualTypeOf<string[]>();
		expectTypeOf(fn({ a: 1 })).toEqualTypeOf<Record<string, string>>();
		expectTypeOf(map((x: number) => x > 1, [1, 2, 3])).toEqualTypeOf<boolean[]>();
		expect(map((x: number) => x > 1, [1, 2, 3])).toEqual([false, true, true]);
	});

	it('no index', () => {
		const fn = map((x: number, i?: any) => {
			expect(i).toBe(undefined);
			return x * x;
		});

		expect(fn([1])).toEqual([1]);
	});
});
