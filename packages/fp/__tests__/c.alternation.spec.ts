import * as FP from '@deot/helper-fp';

describe('alternation.ts', () => {
	it('base', () => {
		const f = FP.alternation(() => false, (x: any) => x + '!');

		expect(f('foo')).toBe('foo!');
	});
});
