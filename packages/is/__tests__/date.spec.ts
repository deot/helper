import * as Is from '@deot/helper-is';

describe('date.ts', () => {
	it('Basic', () => {
		expect(Is.date()).toBe(false);
		expect(Is.date(new Date())).toBe(true);
	});
});

