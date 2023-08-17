import * as Is from '@deot/helper-is';

describe('array.ts', () => {
	it('Basic', () => {
		expect(Is.array()).toBe(false);

		expect(Is.array([])).toBe(true);
		expect(Is.array(new Array(1))).toBe(true);

		expect(Is.array(document.querySelectorAll('body'))).toBe(false);
	});
});

