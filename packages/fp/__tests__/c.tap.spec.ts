import * as FP from '@deot/helper-fp';

describe('tap.ts', () => {
	it('base', () => {
		let f = FP.tap(FP.identity);

		expect(f('foo')).toBe('foo');
		expect(f(null)).toBe(null);
	});
});
