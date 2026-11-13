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

	it('trailing 执行后仍保持间隔', async () => {
		const calls: number[] = [];
		const throttle = Utils.throttle((v: number) => {
			calls.push(v);
		}, 100);

		throttle(1); // leading
		await t.sleep(30);
		throttle(2); // 100ms 时 trailing 执行
		await t.sleep(90);
		expect(calls).toEqual([1, 2]);

		throttle(3); // 紧跟 trailing 之后，不应立即执行
		expect(calls).toEqual([1, 2]);

		await t.sleep(120);
		expect(calls).toEqual([1, 2, 3]);
	});

	it('trailing: false', async () => {
		const calls: number[] = [];
		const throttle = Utils.throttle((v: number) => {
			calls.push(v);
		}, 20, { trailing: false });

		throttle(1);
		throttle(2);
		await t.sleep(40);
		expect(calls).toEqual([1]);

		throttle(3); // 时间窗已结束，重新触发 leading
		expect(calls).toEqual([1, 3]);
	});

	it('types', () => {
		const calls: number[] = [];
		const options: Utils.ThrottleOptions = { leading: true, trailing: false };
		const throttle: Utils.Debounced<(v: number) => void> = Utils.throttle((v: number) => {
			calls.push(v);
		}, 10, options);

		throttle(1);
		// @ts-expect-error 参数类型与原函数不一致
		throttle('2');
		throttle.cancel();

		expect(calls).toEqual([1]);
	});
});
