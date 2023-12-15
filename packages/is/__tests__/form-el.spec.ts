import * as Is from '@deot/helper-is';

describe('form-el.ts', () => {
	const formEl = document.createElement('form');
	it('Basic', () => {
		expect(Is.formEl()).toBe(false);
		expect(Is.formEl(formEl)).toBe(true);
	});
});
