import * as FP from '@deot/helper-fp';

const { Monad } = FP;
const R = {
	toUpper: (x: string) => x.toUpperCase(),
	identity: (x: any) => x,
	pipe: (...funcs: any[]) => funcs.reduceRight((a, b) => (...args: any[]) => a(b(...args))),
	add2: (a: string) => a + '2',
	add3: (a: string) => a + '3'
};

describe('monad.ts', () => {
	it('map', () => {
		const current = Monad.of('Hello Monads!')
			.map(R.toUpper)
			.map(R.identity);
		expect(current instanceof Monad).toBe(true);
		expect(current.flatMap(R.identity).valueOf()).toBe('HELLO MONADS!');
		expect(current.flatMap(R.identity).toString()).toBe('Monad(HELLO MONADS!)');
	});

	it('flatMap', () => {
		const current = Monad.of('1')
			.flatMap(R.add2)
			.flatMap(R.add3);

		expect(current.valueOf()).toBe('123');
	});

	it('flatMap, chain', () => {
		// fn返回Monad时展平一层
		const current = Monad.of(1)
			.flatMap((x: number) => Monad.of(x + 1))
			.flatMap((x: number) => Monad.of(x + 1));

		expect(current instanceof Monad).toBe(true);
		expect(current.valueOf()).toBe(3);
		expect(current.toString()).toBe('Monad(3)');
	});

	it('flatMap, immutable', () => {
		const inner = Monad.of(1);
		const current = Monad.of(inner);

		current.flatMap(R.identity);
		current.join();
		current.flatten();

		// 不修改当前实例
		expect(current.value).toBe(inner);
	});

	it('join', () => {
		const current = Monad.of(Monad.of(Monad.of('Hello Monads!')));

		// 只展平一层
		expect(current.join().value instanceof Monad).toBe(true);
		expect(current.join().join().value).toBe('Hello Monads!');
		expect(current.join().join().join().value).toBe('Hello Monads!');
	});

	it('flatten safe', () => {
		// 避免了所有的错误处理代码，但没有确保函数执行时是否报错
		const safeAdd = R.pipe(
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			(x: any) => x.flatten(),
			(x: any) => x.map(R.add2),
			(x: any) => x.map(R.add3),
			(x: any) => x.value
		);
		expect(safeAdd('1')).toBe('123');
	});

	it('Monadic: map / flatten / valueOf / toString', () => {
		const current = Monad.of(Monad.of(Monad.of(Monad.of('Hello Monads!'))))
			.flatten()
			.map(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe('HELLO MONADS!');
		expect(current.toString()).toMatch(`Monad(HELLO MONADS!)`);
	});

	it('types', () => {
		expectTypeOf(Monad.of('Hello Monads!')).toEqualTypeOf<FP.Monad<string>>();
		expectTypeOf(Monad.of('Hello Monads!').map(x => x.length)).toEqualTypeOf<FP.Monad<number>>();
		expectTypeOf(FP.Pointed.of(1).map(x => String(x))).toEqualTypeOf<FP.Pointed<string>>();
	});
});
