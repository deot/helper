import * as Is from '@deot/helper-is';

describe('nil.ts', () => {
	it('Basic', () => {
		expect(Is.nil(null)).toBe(true);
		expect(Is.nil(undefined)).toBe(true);
		expect(Is.nil()).toBe(true);
	});

	it('其它假值不算', () => {
		expect(Is.nil('')).toBe(false);
		expect(Is.nil(0)).toBe(false);
		expect(Is.nil(NaN)).toBe(false);
		expect(Is.nil(false)).toBe(false);
		expect(Is.nil({})).toBe(false);
		expect(Is.nil([])).toBe(false);
		expect(Is.nil(1)).toBe(false);
	});
});
