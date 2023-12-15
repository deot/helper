import { Utils as t } from '@deot/dev-test';
import * as Utils from '@deot/helper-utils';
// import * as Utils from 'lodash';

describe('throttle.ts', () => {
	it('wait = 0', async () => {
		expect.assertions(3);
		let next = 1;
		const throttle = Utils.throttle((v: number) => {
			expect(v).toBe(next);
			next++;
		});

		throttle(1);
		throttle(2);
		throttle(3);

		await t.sleep(30);
	});

	it('basic', async () => {
		expect.assertions(1);
		const throttle = Utils.throttle((v: number) => {
			expect(v).toBe(1);
		}, 10);

		throttle(1);

		await t.sleep(30);
	});

	it('10ms', async () => {
		expect.assertions(2);
		let next = 1;
		const throttle = Utils.throttle((v: number) => {
			expect(v).toBe(next);
			next++;
		}, 10);

		throttle(1);
		throttle(2); // 均被取消
		throttle(2); // 均被取消
		throttle(3); // 均被取消
		throttle(4); // 均被取消
		throttle(5); // 均被取消
		throttle(2);

		await t.sleep(30);
	});

	it('cancel', async () => {
		expect.assertions(1);
		const throttle = Utils.throttle((v: number) => {
			expect(v).toBe(1);
		}, 10);

		throttle(1);
		throttle(2);
		throttle(2);
		throttle(2);
		throttle(2);
		throttle(2);
		throttle(2);
		throttle(3);

		throttle.cancel();
		throttle.flush();
		await t.sleep(30);
	});

	it('flush', async () => {
		expect.assertions(2);
		let next = 1;
		const throttle = Utils.throttle((v: number) => {
			expect(v).toBe(next);
			next++;
		}, 10000000);

		throttle(1);
		throttle(3);
		throttle(3);
		throttle(3);
		throttle(3);
		throttle(3);
		throttle(3);
		throttle(2);

		throttle.flush();
		throttle.flush(); // 不会再执行
		throttle.flush(); // 不会再执行
		throttle.flush(); // 不会再执行
		throttle.flush(); // 不会再执行
		await t.sleep(30);
	});
});
