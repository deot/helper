import * as Is from '@deot/helper-is';

describe('string.ts', () => {
	it('Basic', () => {
		expect(Is.string()).toBe(false);
		expect(Is.string('')).toBe(true);
		expect(Is.string(1)).toBe(false);
		expect(Is.string({})).toBe(false);
		expect(Is.string([])).toBe(false);
	});
});

