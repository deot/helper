Object.defineProperty(window, 'requestIdleCallback', { value: null });
Object.defineProperty(window, 'cancelIdleCallback', { value: null });

import { Utils as t } from '@deot/dev-test';

describe('ric.ts', async () => {
	const Utils = await import('@deot/helper-utils');
	it('setTimeout', async () => {
		expect.hasAssertions();
		Utils.ric((e) => {
			expect(e.didTimeout).toBe(false);
			expect(e.timeRemaining()).toBeGreaterThan(0);
			expect(1).toBe(1);
		});
		await t.sleep(20);
	});
	it('clearTimeout', async () => {
		expect.hasAssertions();
		let count = 0;
		const v = Utils.ric(() => {
			count++;
		});
		await Promise.resolve();
		Utils.cic(v);
		await t.sleep(20);
		expect(count).toBe(0);
	});
});
