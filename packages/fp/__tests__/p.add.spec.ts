import * as FP from '@deot/helper-fp';

describe('add.ts', () => {
	it('basic', () => {
		let a = 1;
		let b = 2;
		expect(a + b).toBe(3);
		expect(FP.add(a, b)).toBe(3);
		expect(FP.add(b, a)).toBe(3);
	});
	it('float', () => {
		let a = 0.1;
		let b = 0.11;
		expect(a + b).toBe(0.21000000000000002);
		expect(FP.add(a, b)).toBe(0.21);
		expect(FP.add(b, a)).toBe(0.21);
	});
});
