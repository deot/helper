import * as FP from '@deot/helper-fp';

const { IO, Monad } = FP;
const R = {
	toUpper: (x: string) => {
		return x.toUpperCase();
	},
	addSuffix: (x: string) => x += '!',
	identity: (x: any) => x
};

describe('io.ts', () => {
	it('map', () => {
		const current = IO.of('Hello IOs!')
			.map(R.toUpper)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.addSuffix)
			.map(R.identity);

		expect(current instanceof IO).toBe(true);
		expect(current.valueOf()).toBe('HELLO IOS!!!!');
		expect(current.toString()).toMatch('IO(HELLO IOS!!!!)');
	});

	it('flatMap', () => {
		const current = IO.of(IO.of(IO.of('Hello IOs!')))
			.flatMap(R.toUpper)
			.flatMap(R.addSuffix)
			.flatMap(R.addSuffix)
			.flatMap(R.addSuffix)
			.flatMap(R.identity);

		expect(current instanceof IO).toBe(true);
		expect(current.valueOf()).toBe('HELLO IOS!!!!');
		expect(current.toString()).toMatch('IO(HELLO IOS!!!!)');
	});

	it('Monadic: map / flatMap / valueOf / toString', () => {
		const current = IO.of(IO.of(Monad.of(IO.of('Hello IOs!'))))
			.flatMap(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe('HELLO IOS!');
		expect(current.toString()).toMatch('IO(HELLO IOS!)');
	});
});
