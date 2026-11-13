import * as FP from '@deot/helper-fp';

const { IO, Monad } = FP;
const R = {
	toUpper: (x: string) => {
		return x.toUpperCase();
	},
	addSuffix: (x: string) => x + '!',
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

	it('lazy', () => {
		const fn = vi.fn(R.toUpper);
		const current = IO.of('Hello IOs!').map(fn);

		// 直到取值才真正执行
		expect(fn).toBeCalledTimes(0);
		expect(current.valueOf()).toBe('HELLO IOS!');
		expect(fn).toBeCalledTimes(1);
	});

	it('value', () => {
		// 未经过map时可以直接取值
		expect(IO.of(5).valueOf()).toBe(5);
		expect(IO.of(5).toString()).toBe('IO(5)');
		expect(IO.of(null).map(R.identity).valueOf()).toBe(null);

		// 函数作为值时不会被执行
		const fn = () => 5;
		expect(IO.of(fn).valueOf()).toBe(fn);
		expect(IO.of(fn).map(x => typeof x).valueOf()).toBe('function');
	});

	it('flatMap', () => {
		const current = IO.of('Hello IOs!')
			.flatMap(x => IO.of(R.toUpper(x)))
			.flatMap(x => IO.of(x).map(R.addSuffix))
			.flatMap(R.addSuffix)
			.flatMap(R.addSuffix)
			.flatMap(R.identity);

		expect(current instanceof IO).toBe(true);
		expect(current.valueOf()).toBe('HELLO IOS!!!!');
		expect(current.toString()).toMatch('IO(HELLO IOS!!!!)');
	});

	it('join', () => {
		const current = IO.of(IO.of(IO.of('Hello IOs!')));

		// 只展平一层
		expect(current.join().valueOf() instanceof IO).toBe(true);
		expect(current.join().join().valueOf()).toBe('Hello IOs!');
		expect(current.join().join().join().valueOf()).toBe('Hello IOs!');
	});

	it('Monadic: map / flatten / valueOf / toString', () => {
		const current = IO.of(IO.of(Monad.of(IO.of('Hello IOs!'))))
			.flatten()
			.map(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe('HELLO IOS!');
		expect(current.toString()).toMatch('IO(HELLO IOS!)');
	});

	it('types', () => {
		expectTypeOf(IO.of('Hello IOs!')).toEqualTypeOf<FP.IO<string>>();
		expectTypeOf(IO.of('Hello IOs!').map(x => x.length)).toEqualTypeOf<FP.IO<number>>();
		expectTypeOf(IO.of(1).flatMap(x => IO.of(String(x)))).toEqualTypeOf<FP.IO<string>>();
		expectTypeOf(IO.of(1).valueOf()).toEqualTypeOf<number>();
	});
});
