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
});
