import { Task, Job } from '@deot/helper-scheduler';

const sleep = (s: number) => new Promise((_) => { setTimeout(_, s || 0); });

let count = 0;
const current = Job.of(
	Task.of('Hello Jobs!')
		.map((v: any) => {
			count++;
			return v;
		}),
	9
);

describe('job.ts', () => {
	it('start', async () => {
		const record = count;

		current.start();
		await sleep(30);
		expect(count).not.toBe(record);
	});

	it('pasue', async () => {
		const record = count;

		current.pasue();
		await sleep(30);
		expect(count).toBe(record);
	});

	it('resume', async () => {
		const record = count;

		current.resume();
		await sleep(30);
		expect(count).not.toBe(record);
	});

	it('cancel', async () => {
		const record = count;

		current.cancel();
		await sleep(30);
		expect(count).toBe(record);
	});

	it('restart', async () => {
		const record = count;

		current.restart();
		await sleep(30);
		expect(count).not.toBe(record);
		current.cancel();
	});

	it('start avoid repeat', async () => {
		let count$ = 0;
		const current$ = Job.of(
			Task.of('Hello Jobs!')
				.map((v: any) => {
					count$++;
					return v;
				}),
			9
		);

		current$.start();
		current$.start();
		current$.start();
		current$.start();
		current$.start();
		current$.start();
		current$.start();
		current$.start();

		expect(current$.isStart).toBe(true);
		await sleep(9);

		expect(count$).toBeLessThanOrEqual(2);

		current$.cancel();
	});

	it('func', async () => {
		let count$ = 0;
		let record = 0;
		const current$ = Job.of(
			async () => {
				count$++;
				await sleep(1);
			},
			9
		);
		expect.assertions(6);

		// 开始
		current$.start();
		await sleep(30);
		expect(count$).not.toBe(record);

		// 暂停
		current$.pasue(); // 可能存在正在就
		record = count$;
		await sleep(30);
		expect(count$).toBe(record);

		// 恢复
		current$.resume();
		await sleep(30);
		expect(count$).not.toBe(record);

		// 取消
		current$.cancel();
		record = count$;
		await sleep(30);
		expect(count$).toBe(record);

		// 重新开始
		current$.restart();
		await sleep(30);
		expect(count$).not.toBe(record);

		current$.cancel();

		expect(count$).toBeGreaterThanOrEqual(8);
	});

	it('fulfilled / rejected', async () => {
		expect.assertions(2);
		let count$ = 0;
		const current$ = Job.of(
			Task.of('Hello Jobs!')
				.map((v: any) => {
					count$++;
					if (count$ >= 2) {
						throw new Error(v);
					}
					return count$;
				}),
			10
		);

		current$.once('fulfilled', (e: any) => {
			expect(e).toBe(1);
		});

		current$.once('rejected', (e: any) => {
			expect(e.message).toBe(`Hello Jobs!`);
		});

		current$.start();
		await sleep(25);
		current$.end();
	});

	it('func - fulfilled / rejected', async () => {
		expect.assertions(2);
		let count$ = 0;
		const current$ = Job.of(
			async () => {
				count$++;
				if (count$ >= 2) {
					throw new Error('Hello Jobs!');
				}
				return count$;
			},
			10
		);

		current$.once('fulfilled', (e: any) => {
			expect(e).toBe(1);
		});

		current$.once('rejected', (e: any) => {
			expect(e.message).toBe(`Hello Jobs!`);
		});

		current$.start();
		await sleep(25);
		current$.end();
	});

	it('for coverage', async () => {
		let count$ = 0;
		const current$ = Job.of(
			Task.of('Hello Jobs!')
				.map((v: any) => {
					count$++;
					return v;
				})
				.cancel()
				.start()
		);

		current$.immediate();
		expect(current$.isStart).toBe(true);
		await sleep(25);

		expect(count$).not.toBe(0);

		current$.cancel();
		current$.end();
	});

	it('cancel + restart, single loop', async () => {
		let count$ = 0;
		const current$ = Job.of(async () => { count$++; }, 20);

		// 取消时旧循环正处于interval等待中，重启后不应该被复活
		current$.start();
		await sleep(10);
		current$.cancel();
		count$ = 0;
		current$.restart();
		await sleep(100);
		current$.cancel();

		// 单循环约5~6次，双循环会在10次以上
		expect(count$).toBeGreaterThanOrEqual(3);
		expect(count$).toBeLessThanOrEqual(7);
	});

	it('cancel + restart, in-flight', async () => {
		let count$ = 0;
		const fulfilled = vi.fn();
		const current$ = Job.of(async () => {
			const index = ++count$;
			await sleep(15);
			return index;
		}, 20);

		current$.on('fulfilled', fulfilled);

		// 取消时函数还在执行中，它的结果不应该再触发事件，也不会续上旧循环
		current$.start();
		await sleep(5);
		current$.restart();
		await sleep(100);
		current$.cancel();

		const values = fulfilled.mock.calls.map(i => i[0]);
		expect(values).not.toContain(1);
		expect(values[0]).toBe(2);
		expect(count$).toBeLessThanOrEqual(5);
	});

	it('restart + start, single loop', async () => {
		let count$ = 0;
		const current$ = Job.of(async () => { count$++; }, 20);

		current$.start();
		await sleep(30);
		current$.cancel();
		await sleep(30);

		count$ = 0;
		current$.restart();
		current$.start();
		expect(current$.isStart).toBe(true);

		await sleep(100);
		current$.cancel();

		expect(count$).toBeGreaterThanOrEqual(3);
		expect(count$).toBeLessThanOrEqual(7);
	});

	it('start, after cancel', async () => {
		let count$ = 0;
		const current$ = Job.of(async () => { count$++; }, 5);

		current$.start();
		await sleep(10);
		current$.cancel();
		expect(current$.isStart).toBe(false);
		expect(current$.isCancel).toBe(true);

		const record = count$;
		current$.start();
		await sleep(10);
		current$.cancel();

		expect(count$).toBeGreaterThan(record);
	});

	it('cancel, during pause', async () => {
		let count$ = 0;
		const current$ = Job.of(async () => { count$++; }, 5);

		current$.start();
		await sleep(10);
		current$.pause();
		// 等循环停在暂停点上再取消
		await sleep(15);
		current$.cancel();
		expect(current$.isPause).toBe(false);

		// 重新开始后不会停留在之前的暂停状态
		const record = count$;
		current$.start();
		await sleep(20);
		current$.cancel();

		expect(count$).toBeGreaterThan(record);
	});

	it('cancel, without rejected event', async () => {
		const fulfilled = vi.fn();
		const rejected = vi.fn();
		const current$ = Job.of(
			Task.of('Hello Jobs!').map(async (v: any) => {
				await sleep(20);
				return v;
			}),
			5
		);

		current$.on('fulfilled', fulfilled);
		current$.on('rejected', rejected);
		current$.start();
		await sleep(10);
		current$.cancel();
		await sleep(30);

		expect(fulfilled).toBeCalledTimes(0);
		expect(rejected).toBeCalledTimes(0);
	});

	it('cancel, in listener', async () => {
		let count$ = 0;
		const current$ = Job.of(async () => ++count$, 5);

		current$.once('fulfilled', () => current$.cancel());
		current$.start();
		await sleep(30);

		// 监听器内取消后不再有下一轮
		expect(count$).toBe(1);
		expect(current$._timer).toBe(null);
	});

	it('chain / resume without pause', async () => {
		const current$ = Job.of(async () => {}, 5);

		expect(() => current$.resume()).not.toThrow();
		expect(current$.start()).toBe(current$);
		expect(current$.pause()).toBe(current$);
		expect(current$.pasue()).toBe(current$);
		expect(current$.isPasue).toBe(true);
		expect(current$.pasuer).toBe(current$.pauser);
		expect(current$.resume()).toBe(current$);
		expect(current$.restart()).toBe(current$);
		expect(current$.cancel()).toBe(current$);

		current$.setPasueStatus(true);
		expect(current$.isPause).toBe(true);
		expect(await current$.suspend(1, Promise.resolve())).toBe(1);
		expect(await current$.suspend(2)).toBe(2);
		current$.setPasueStatus(false);
	});
});
