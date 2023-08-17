import * as Is from '@deot/helper-is';

describe('number.ts', () => {
	it('Basic', () => {
		expect(Is.number()).toBe(false);
		expect(Is.number(1)).toBe(true);
		expect(Is.number('1')).toBe(false);
		expect(Is.number(NaN)).toBe(true);
		expect(Is.number(Infinity)).toBe(true);
	});
});

