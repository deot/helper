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
		let current = Monad.of('Hello Monads!')
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

	it('flatMap safe', () => {
		// 避免了所有的错误处理代码，但没有确保函数执行时是否报错
		const safeAdd = R.pipe(
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			Monad.of,
			(x: any) => x.flatMap(R.add2), 
			(x: any) => x.flatMap(R.add3), 
			(x: any) => x.value
		);
		expect(safeAdd('1')).toBe('123');
	});

	it('Monadic: map / flatMap / valueOf / toString', () => {
		let current = Monad.of(Monad.of(Monad.of(Monad.of('Hello Monads!'))))
			.flatMap(R.toUpper)
			.map(R.identity);

		expect(current.valueOf()).toBe('HELLO MONADS!');
		expect(current.toString()).toMatch(`Monad(HELLO MONADS!)`);
	});
});
