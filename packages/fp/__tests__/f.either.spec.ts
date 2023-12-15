import * as FP from '@deot/helper-fp';

const { Either, Monad } = FP;
const R = {
	add: (base: any) => (x: any) => x + base,
	identity: (x: any) => x,
	parse: (x: any) => JSON.parse(x)
};

const parseJSON = (v: string) => {
	try {
		return Either.right(JSON.parse(v));
	} catch (e: any) {
		return Either.left(e);
	}
};

describe('either.ts', () => {
	it('basic', () => {
		const right = Either.right(12).flatMap(R.add(2));
		const left = Either.left(12).flatMap(R.add(2));

		expect(right.valueOf()).toBe(14);
		expect(left.valueOf()).toBe(12);
	});

	it('funcs', () => {
		expect(Either.of).toBe(Either.try);
		expect(Either.ok).toBe(Either.right);
		expect(Either.error).toBe(Either.left);
	});

	it('static error/left', () => {
		const run = (v: any) => {
			expect(v.isLeft).toBe(true);
			expect(v.isRight).toBe(false);
			expect(v.toString()).toMatch('Either.Left');
			expect(v.flatMap(R.identity).valueOf().message).toMatch(`in JSON at position 1`);
		};

		const json = '{name:deot}';

		run(parseJSON(json));
		run(Either.of(() => R.parse(json)));
	});

	it('static ok/right', () => {
		const run = (v: any) => {
			expect(v.isLeft).toBe(false);
			expect(v.isRight).toBe(true);
			expect(v.toString()).toMatch('Either.Right');
			expect(v.flatMap(R.identity).valueOf()).toEqual({ name: 'deot' });
		};

		const json = '{"name":"deot"}';

		run(parseJSON(json));
		run(Either.of(() => R.parse(json)));
	});

	it('Monadic: map / flatMap / valueOf / toString', () => {
		const current = Either.right(Either.right(Monad.of(Either.of(() => 1))))
			.flatMap(R.add(1))
			.map(R.add(1))
			.map(R.identity);

		expect(current.valueOf()).toBe(3);
		expect(current.toString()).toBe(`Either.Right(3)`);
	});
});
