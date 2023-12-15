import * as FP from '@deot/helper-fp';

describe('fork.ts', () => {
	it('base', () => {
		const f = FP.fork(
			(a: any, b: any) => a === b,
			(x: any) => x,
			(x: any) => x,
		);

		expect(f('foo')).toBe(true);
	});
});
