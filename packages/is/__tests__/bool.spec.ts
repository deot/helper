import * as Is from '@deot/helper-is';

describe('bool.ts', () => {
	it('Basic', () => {
		expect(Is.bool()).toBe(false);
		expect(Is.bool(1)).toBe(false);
		expect(Is.bool(0)).toBe(false);
		expect(Is.bool(true)).toBe(true);
		expect(Is.bool(false)).toBe(true);
	});
});

