import * as FP from '@deot/helper-fp';

const { curry } = FP;
describe('curry.ts', () => {
	it('placeholder', () => {
		const __ = curry;
		const sum = (a: any, b: any, c: any) => {
			return String(a) + String(b) + String(c);
		};
		const g = curry(sum);

		const expected = '123';
		expect(g(1, 2, 3)).toBe(expected);
		expect(g(__, 2, 3)(1)).toBe(expected);
		expect(g(__, __, 3)(1)(2)).toBe(expected);
		expect(g(__, __, 3)(1, 2)).toBe(expected);
		expect(g(__, 2, __)(1, 3)).toBe(expected);
		expect(g(__, 2)(1)(3)).toBe(expected);
		expect(g(__, 2)(1, 3)).toBe(expected);
		expect(g(__, 2)(__, 3)(1)).toBe(expected);

		expect(g(__, __, 3)(__, 2)(1)).toBe(expected);
		expect(g(__, 2, __)(__, 3)(1)).toBe(expected);
		expect(g(__, 2)(__)(__, 3)(__)(1)).toBe(expected);
	});

	it('this', () => {
		const sum = function (this: any, b: any, c: any) {
			return String(this.a) + String(b) + String(c);
		};
		const ctx1 = { a: 'non-effect' };
		const ctx2 = { a: 1 };
		const expected = '123';

		const g = curry(sum);

		// 以最后绑定的this为主
		expect(g.call(ctx1, 2).call(ctx2, 3)).toBe(expected);
	});

	it('types', () => {
		const __ = curry;
		const g = curry((a: number, b: string, c: boolean) => `${a}${b}${c}`);

		expectTypeOf(g(1, '2', true)).toEqualTypeOf<string>();
		expectTypeOf(g(1, '2')(true)).toEqualTypeOf<string>();
		expectTypeOf(g(1)('2')(true)).toEqualTypeOf<string>();
		expectTypeOf(g(1)('2', true)).toEqualTypeOf<string>();
		expectTypeOf(g()(1)()('2')(true)).toEqualTypeOf<string>();

		// 使用占位符时退回宽松签名
		expectTypeOf(g(__, '2')).toEqualTypeOf<any>();
		expect(g(__, '2')(1, true)).toBe('12true');

		// 无形参时直接执行
		expectTypeOf(curry(() => 1)()).toEqualTypeOf<number>();
		expect(curry(() => 1)()).toBe(1);
	});
});
