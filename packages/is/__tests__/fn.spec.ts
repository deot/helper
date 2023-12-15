import * as Is from '@deot/helper-is';

describe('fn.ts', () => {
	it('Basic', () => {
		expect(Is.fn()).toBe(false);
		expect(Is.fn(() => {})).toBe(true);
		expect(Is.fn(class A {})).toBe(true);
		expect(Is.fn({})).toBe(false);
		expect(Is.fn([])).toBe(false);
	});
});
