import * as FP from '@deot/helper-fp';

describe('alternation.ts', () => {
	it('base', () => {
		let f = FP.alternation(() => false, (x: any) => x + '!');

		expect(f('foo')).toBe('foo!');
	});
});
