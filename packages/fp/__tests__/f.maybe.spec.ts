import * as FP from '@deot/helper-fp';

const { Maybe, Monad } = FP;
const R = {
	toUpper: (x: string) => x.toUpperCase(),
	addSuffix: (x: string) => x + '!',
	identity: (x: any) => x
};

describe('maybe.ts', () => {
	it('just', () => {
		const current = Maybe.of('Hello Maybes!')
			.map(R.toUpper)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.identity);

		expect(current instanceof Maybe).toBe(true);
		expect(current.isNothing()).toBe(false);
		expect(current.isJust()).toBe(true);
		expect(current.valueOf()).toBe('HELLO MAYBES!!!!');
		expect(current.toString()).toBe(`Maybe.Just(HELLO MAYBES!!!!)`);
		expect(current.flatMap(R.identity).valueOf()).toBe('HELLO MAYBES!!!!');
	});

	it('nothing', () => {
		const current = Maybe.of(null)
			.flatMap(R.toUpper)
			.flatMap(R.identity);

		expect(current instanceof Maybe).toBe(true);
		expect(current.isNothing()).toBe(true);
		expect(current.isJust()).toBe(false);
		expect(current.valueOf()).toBe(null);
		expect(current.valueOf('other')).toBe('other');
		expect(current.toString()).toBe(`Maybe.Nothing`);
		expect(current.flatMap(R.identity).valueOf()).toBe(null);
	});

	it('flatMap, chain', () => {
		const safeProp = (key: string) => (x: any) => Maybe.of(x[key]);

		const just = Maybe.of({ a: { b: 'Hello Maybes!' } })
			.flatMap(safeProp('a'))
			.flatMap(safeProp('b'))
			.map(R.toUpper);
		expect(just.toString()).toBe(`Maybe.Just(HELLO MAYBES!)`);

		// 中途为空时后续不再执行
		const nothing = Maybe.of({ a: null })
			.flatMap(safeProp('a'))
			.flatMap(safeProp('b'))
			.map(R.toUpper);
		expect(nothing.toString()).toBe(`Maybe.Nothing`);
	});

	it('Monadic: map / flatten / valueOf / toString', () => {
		const current = Maybe.of(Maybe.of(Monad.of(Maybe.of(null))))
			.flatten()
			.map(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe(null);
		expect(current.toString()).toBe(`Maybe.Nothing`);
	});

	it('types', () => {
		expectTypeOf(Maybe.of('Hello Maybes!').map(x => x.length)).toEqualTypeOf<FP.Maybe<number>>();
		// map的回调拿到的是非空值
		Maybe.of('Hello Maybes!' as string | null).map((x) => {
			expectTypeOf(x).toEqualTypeOf<string>();
			return x;
		});
	});
});
