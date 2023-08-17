import * as Is from '@deot/helper-is';

describe('params.ts', () => {
	let params = new URLSearchParams();
	it('Basic', () => {
		expect(Is.params()).toBe(false);
		expect(Is.params(params)).toBe(true);
	});
});

