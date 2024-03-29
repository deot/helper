import * as FP from '@deot/helper-fp';

const { Maybe, Monad } = FP;
const R = {
	toUpper: (x: string) => x.toUpperCase(),
	addSuffix: (x: string) => x += '!',
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

	it('Monadic: map / flatMap / valueOf / toString', () => {
		const current = Maybe.of(Maybe.of(Monad.of(Maybe.of(null))))
			.flatMap(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe(null);
		expect(current.toString()).toBe(`Maybe.Nothing`);
	});
});
