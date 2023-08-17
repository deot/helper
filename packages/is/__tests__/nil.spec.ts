import * as Is from '@deot/helper-is';

describe('nil.ts', () => {
	it('Basic', () => {
		expect(Is.nil()).toBe(false);
		expect(Is.nil('')).toBe(false);
		expect(Is.nil({})).toBe(false);
		expect(Is.nil([])).toBe(false);
		expect(Is.nil(1)).toBe(false);
		expect(Is.nil(null)).toBe(true);
	});
});

