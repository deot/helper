import * as FP from '@deot/helper-fp';

const { filter } = FP; // 同ramda api，不同于loadsh（第一个参数为值）
const isEven = (n: number) => n % 2 === 0;

describe('filter.ts', () => {
	it('array', () => {
		const fn = filter(isEven);

		expect(fn([1, 2, 3])).toEqual([2]);
	});

	it('object', () => {
		const fn = filter(isEven);

		expect(fn({ a: 1, b: 2, c: 3 })).toEqual({ b: 2 });
	});

	it('types', () => {
		const fn = filter(isEven);

		expectTypeOf(fn([1, 2, 3])).toEqualTypeOf<number[]>();
		expectTypeOf(fn({ a: 1 })).toEqualTypeOf<Record<string, number>>();
		expectTypeOf(filter(isEven, [1, 2, 3])).toEqualTypeOf<number[]>();
		expect(filter(isEven, [1, 2, 3])).toEqual([2]);
	});
});
