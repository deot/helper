import * as Utils from '@deot/helper-utils';

describe('generate-string.ts', () => {
	it('basic', () => {
		expect(Utils.generateString().length).toBe(16);
		expect(Utils.generateString(32).length).toBe(32);
	});
});

