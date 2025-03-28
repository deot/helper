import * as FP from '@deot/helper-fp';

describe('memoize.ts', () => {
	it('nothing', () => {
		let count = 0;
		const factorial = FP.memoize(() => {
			count++;
			return Math.random();
		});

		factorial(1);
		factorial(1);
		factorial(1);
		factorial(1);
		factorial(1);
		expect(count).toBe(5);
	});

	it('base', () => {
		let count = 0;
		const factorial = FP.memoize((n: number) => {
			count++;
			return Math.random() * n;
		});

		expect(factorial(1)).toBe(factorial(1));

		factorial(1);
		factorial(1);
		factorial(1);
		factorial(1);
		factorial(1);
		expect(count).toBe(1);
	});

	it('resolver', () => {
		let count = 0;
		const fn = (v: any) => {
			count++;
			return Math.random() * v.n;
		};
		const factorial = FP.memoize(fn, JSON.stringify);

		expect(factorial({ n: 9 })).toBe(factorial({ n: 9 }));

		factorial({ n: 9 });
		factorial({ n: 9 });
		factorial({ n: 9 });
		factorial({ n: 9 });
		factorial({ n: 9 });
		expect(count).toBe(1);
	});

	it('args[0]', () => {
		let count = 0;
		const factorial = FP.memoize((a: number, b: number) => {
			count++;
			return Math.random() * a * b;
		});

		expect(factorial(4, 7)).toBe(factorial(4, 7));

		factorial(4, 1);
		factorial(4, 2);
		factorial(4, 3);
		factorial(4, 4);
		factorial(4, 5);
		expect(count).toBe(1);
	});

	it('args/resolver', () => {
		let count = 0;
		const factorial = FP.memoize((a: number, b: number) => {
			count++;
			return Math.random() * a * b;
		}, (a: number, b: number) => `${a}#${b}`);

		expect(factorial(4, 6)).toBe(factorial(4, 6));
		expect(factorial(4, 7)).toBe(factorial(4, 7));
		expect(factorial(4, 6)).not.toBe(factorial(4, 7));

		factorial(4, 6);
		factorial(4, 6);
		factorial(4, 6);
		factorial(4, 7);
		factorial(4, 7);
		factorial(4, 7);
		expect(count).toBe(2);
	});
});
