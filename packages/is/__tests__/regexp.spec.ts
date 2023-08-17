import * as Is from '@deot/helper-is';

describe('regexp.ts', () => {
	it('Basic', () => {
		expect(Is.regexp()).toBe(false);
		expect(Is.regexp(/abc/)).toBe(true);
		expect(Is.regexp('/abc/')).toBe(false);
	});
});

