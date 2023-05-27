import * as FP from '@deot/helper-fp';

describe('identity.ts', () => {
	it('base', () => {
		expect(FP.identity('foo')).toBe('foo');
		expect(FP.identity(null)).toBe(null);
		expect(FP.identity.length).toBe(1);
	});
});
