import * as FP from '@deot/helper-fp';

const { compose } = FP; 
describe('compose.ts', () => {
	it('base', () => {
		const add = (x: number) => {
			return x + 2;
		};
		const mul = (x: number) => {
			return x * 3;
		};
		const sub = (x: number) => {
			return x - 10;
		};

		const composed = compose(add, mul, sub); 

		// // ((5 - 10) * 3) + 2 = -13
		expect(composed(5)).toBe(-13);

		// other
		expect(compose(add)(1)).toBe(3);
		try {
			expect(compose()(1)).toBe(1);
		} catch {
			// any
		}
	});


	it('this', () => {
		const add = function (this: any, x: number) {
			return x + this.x;
		};
		const mul = function (this: any, x: number) {
			return x * this.y;
		};
		const sub = function (this: any, x: number) {
			return x - this.z;
		};

		const ctx = {
			composed: compose(add, mul, sub),
			x: 2,
			y: 3,
			z: 10
		}; 

		// ((5 - 10) * 3) + 2 = -13
		expect(ctx.composed(5)).toBe(-13);
	});

	it('multiple args', () => {
		let f = (a: any, b: any, c: any) => [a, b, c];
		let g = compose(f);
		expect(g(1, 2, 3)).toEqual([1, 2, 3]);
	});
});
