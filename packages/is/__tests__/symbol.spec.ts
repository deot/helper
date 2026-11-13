import * as Is from '@deot/helper-is';

describe('symbol.ts', () => {
	it('Basic', () => {
		expect(Is.symbol()).toBe(false);
		expect(Is.symbol(Symbol('a'))).toBe(true);
		expect(Is.symbol(Symbol.iterator)).toBe(true);
		expect(Is.symbol('a')).toBe(false);
		expect(Is.symbol(Object(Symbol('a')))).toBe(false);
	});
});
