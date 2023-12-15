import * as FP from '@deot/helper-fp';

describe('add.ts', () => {
	it('basic', () => {
		const a = 1;
		const b = 2;
		expect(a + b).toBe(3);
		expect(FP.add(a, b)).toBe(3);
		expect(FP.add(b, a)).toBe(3);
	});
	it('float', () => {
		const a = 0.1;
		const b = 0.11;
		expect(a + b).toBe(0.21000000000000002);
		expect(FP.add(a, b)).toBe(0.21);
		expect(FP.add(b, a)).toBe(0.21);
	});
});
