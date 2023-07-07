import * as Utils from '@deot/helper-utils';

describe('sleep.ts', () => {
	it('basic', async () => {
		expect.assertions(1);
		await Utils.sleep();
		await Utils.sleep({ min: 10, max: 12 }, () => {
			expect(1).toBe(1);
		});
	});
});

