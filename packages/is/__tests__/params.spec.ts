import * as Is from '@deot/helper-is';

describe('params.ts', () => {
	const params = new URLSearchParams();
	it('Basic', () => {
		expect(Is.params()).toBe(false);
		expect(Is.params(params)).toBe(true);
	});
});
