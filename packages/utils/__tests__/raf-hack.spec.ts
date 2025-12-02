Object.defineProperty(window, 'requestAnimationFrame', { value: null });
Object.defineProperty(window, 'cancelAnimationFrame', { value: null });

import { Utils as t } from '@deot/dev-test';

describe('raf.ts', async () => {
	const Utils = await import('@deot/helper-utils');
	it('setTimeout', async () => {
		expect.assertions(1);
		Utils.raf(() => {
			expect(1).toBe(1);
		});
		await t.sleep(20);
	});
	it('clearTimeout', async () => {
		expect.assertions(1);
		let count = 0;
		const v = Utils.raf(() => {
			count++;
		});
		await t.sleep(1);
		Utils.caf(v);
		await t.sleep(20);
		expect(count).toBe(0);
	});
});
