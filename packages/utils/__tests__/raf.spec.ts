import { Utils as t } from '@deot/dev-test';
import * as Utils from '@deot/helper-utils';

describe('raf.ts', () => {
	it('basic', async () => {
		expect.assertions(1);
		Utils.raf(() => {
			expect(1).toBe(1);
		});
		await t.sleep(20);
	});
});

