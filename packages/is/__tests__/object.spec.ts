import * as Is from '@deot/helper-is';

describe('object.ts', () => {
	it('null', () => {
		expect(Is.object(null)).toBe(false);
	});
	it('basic', () => {
		expect(Is.object([])).toBe(true);
		expect(Is.object({})).toBe(true);
		expect(Is.object()).toBe(false);
		expect(Is.object(1)).toBe(false);
		expect(Is.object('')).toBe(false);
		expect(Is.object(true)).toBe(false);
		expect(Is.object(() => {})).toBe(false);
	});
});

