import * as Is from '@deot/helper-is';

describe('undef.ts', () => {
	it('Basic', () => {
		expect(Is.undef()).toBe(true);
		expect(Is.undef('')).toBe(false);
		expect(Is.undef(1)).toBe(false);
		expect(Is.undef(false)).toBe(false);
		expect(Is.undef(null)).toBe(false);
	});
});

