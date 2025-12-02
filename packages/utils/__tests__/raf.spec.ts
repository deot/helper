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
	it('clear', async () => {
		expect.assertions(1);
		let count = 0;
		const v = Utils.raf(() => {
			count++;
		});
		Utils.caf(v);
		await t.sleep(20);
		expect(count).toBe(0);
	});
});
