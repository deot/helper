import * as Is from '@deot/helper-is';

describe('form-data.ts', () => {
	let formData = new FormData();
	it('Basic', () => {
		expect(Is.formData()).toBe(false);
		expect(Is.formData(formData)).toBe(true);
	});
});

