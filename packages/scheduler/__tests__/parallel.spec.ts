import { Parallel, Task, CancelError } from '@deot/helper-scheduler';

const sleep = (s: number) => new Promise((_) => { setTimeout(_, s || 0); });

describe('parallel.ts', () => {
	it('task', async () => {
		let count = 0;
		let record = 0;
		const current = Parallel.of(
			Task.of('Hello Parallels!')
				.map(async (v: any) => {
					await sleep(10);
					count++;
					return v;
				}),
			10
		);

		// 开始
		current.start();
		await sleep(30);
		expect(count).not.toBe(record);

		// 暂停
		current.pasue();
		record = count;
		await sleep(20);
		// task细粒度中断，可能只中断task下的某个任务
		expect(record).toBeLessThan(count + current.tasks.length);

		// 恢复
		current.resume();
		record = count;
		await sleep(20);
		expect(count).not.toBe(record);

		// 取消
		const len = current.tasks.length;
		current.cancel();
		record = count;
		await sleep(20);

		expect(current.tasks.length).toBe(0);
		expect(record).toBeLessThan(count + len); // task细粒度中断, 取消时tasks置空

		// 重启
		current.restart();
		record = count;
		current.setConcurrency(20);
		await sleep(20);
		expect(count).not.toBe(record);

		current.cancel();
	});

	it('tasks', async () => {
		let count = 0;
		const gen = () => {
			return Task.of('Hello Parallels!')
				.map(async (v: any) => {
					await sleep(1);
					count++;
					return v;
				});
		};
		const current = Parallel.of(
			Array.from({ length: 100 }).map(gen),
			4
		);

		const target = current.start();

		await sleep(24);

		expect(count).not.toBe(100);
		expect(count).toBeGreaterThan(30);

		await target;
		expect(count).toBe(100);

		const target1 = current.restart();
		await sleep(25);
		current.cancel();

		expect(count).toBeGreaterThan(100);
		expect(count).toBeLessThan(200);
		expect(current.tasks.length).toBe(0);

		// 取消之后等待者收到CancelError
		await expect(target1).rejects.toBeInstanceOf(CancelError);
	});

	it('func', async () => {
		let count = 0;
		let record = 0;
		const current = Parallel.of(
			async () => {
				await sleep(10);
				count++;
				return count;
			},
			10
		);

		current.on('fulfilled', () => {});
		current.on('rejected', () => {});

		// 开始
		current.start();
		await sleep(30);
		expect(count).not.toBe(record);

		// 暂停
		await current.pasue();
		record = count;
		await sleep(20);
		expect(record).toBe(count);

		// 恢复
		current.resume();
		record = count;
		await sleep(30);
		expect(count).not.toBe(record);

		// 取消
		await current.cancel();
		record = count;
		await sleep(20);
		expect(record).toBe(count);
		expect(current.tasks.length).toBe(0);

		// 重启
		current.restart();
		record = count;
		current.setConcurrency(20);
		await sleep(20);
		expect(count).not.toBe(record);

		current.cancel();
	});

	it('funcs', async () => {
		let count = 0;
		const gen = () => {
			return async () => {
				count++;
				await sleep(1);
			};
		};
		const current = Parallel.of(
			Array.from({ length: 100 }).map(gen),
			4
		);

		const target = current.start();

		await sleep(25);
		expect(count).not.toBe(100);
		expect(count).toBeGreaterThan(30);

		await target;
		expect(count).toBe(100);

		const target1 = current.restart();
		await sleep(25);
		await current.cancel();

		expect(count).toBeGreaterThan(100);
		expect(count).toBeLessThan(200);
		expect(current.tasks.length).toBe(0);

		// 取消之后等待者收到CancelError
		await expect(target1).rejects.toBeInstanceOf(CancelError);
	});

	it('fulfilled / rejected', async () => {
		expect.assertions(2);
		let count = 0;
		const current = Parallel.of(
			async () => {
				await sleep(1);
				count++;
				if (count > 10) {
					throw new Error('Hello Parallels!');
				}
				return count;
			}
		);

		current.once('fulfilled', (e: any) => {
			expect(e).toBe(1);
		});
		current.once('rejected', (e: any) => {
			expect(e.message).toBe(`Hello Parallels!`);
		});

		current.start();

		await sleep(30);
		await current.cancel();
	});

	it('continues after all concurrent tasks reject', async () => {
		let started = 0;
		let rejected = 0;
		const current = Parallel.of(
			Array.from({ length: 6 }).map(() => async () => {
				started++;
				await sleep(1);
				throw new Error('Hello Parallels!');
			}),
			2
		);

		current.on('rejected', () => {
			rejected++;
		});

		await current.start();

		expect(started).toBe(6);
		expect(rejected).toBe(6);
		expect(current.tasks.length).toBe(0);
	});

	it('for coverage', async () => {
		expect.assertions(3);
		let count = 0;
		const current = Parallel.of(
			async () => {
				await sleep(1);
				count++;
				if (count > 40) {
					throw new Error('Hello Parallels!');
				}
			},
			1,
			{
				skipError: false
			}
		);

		current.start();
		current.start().catch((e) => {
			expect(e.message).toBe(`Hello Parallels!`);
		});
		await sleep(2);
		expect(count).not.toBe(0);
		current.setConcurrency(20);

		await sleep(2);
		expect(count).toBeGreaterThan(10);
		await sleep(20);
		current.cancel();
	});

	it('order / results', async () => {
		const order: number[] = [];
		const current = Parallel.of(
			[1, 2, 3].map(i => async () => {
				order.push(i);
				if (i === 2) throw new Error('Hello Parallels!');
				return i;
			}),
			1
		);

		const results = await current.start();

		// 按输入顺序执行
		expect(order).toEqual([1, 2, 3]);
		// 同Promise.allSettled
		expect(results).toEqual([
			{ status: 'fulfilled', value: 1 },
			{ status: 'rejected', reason: new Error('Hello Parallels!') },
			{ status: 'fulfilled', value: 3 }
		]);
		expect(current.isStart).toBe(false);
		expect(current.target).toBe(null);

		// 结束后可以再次开始
		expect(await current.start()).toEqual(results);
		expect(order).toEqual([1, 2, 3, 1, 2, 3]);
	});

	it('results, same order as input', async () => {
		const delays = [30, 1, 15, 5];
		const done: number[] = [];
		const current = Parallel.of(
			delays.map((delay, index) => async () => {
				await sleep(delay);
				done.push(index);
				return index;
			}),
			4
		);

		const results = await current.start();

		// 完成顺序与输入不同，但结果与输入同序
		expect(done).toEqual([1, 3, 2, 0]);
		expect(results.map((i: any) => i.value)).toEqual([0, 1, 2, 3]);
	});

	it('empty', async () => {
		expect(await Parallel.of([]).start()).toEqual([]);
	});

	it('mixed func / task', async () => {
		const gen = () => [
			async () => {
				await sleep(20);
				return 'func';
			},
			Task.of('task').map(async (v: any) => {
				await sleep(20);
				return v;
			})
		];

		const results = await Parallel.of(gen(), 2).start();
		expect(results.map((i: any) => i.value)).toEqual(['func', 'task']);

		// 暂停、恢复、取消都按元素类型分别处理
		const current = Parallel.of(gen(), 2);
		const target = current.start();

		await sleep(5);
		await current.pause();
		current.resume();
		await current.cancel();
		await expect(target).rejects.toBeInstanceOf(CancelError);
	});

	it('setConcurrency, during pause', async () => {
		let count = 0;
		const current = Parallel.of(
			async () => {
				count++;
				await sleep(5);
			},
			1
		);

		// 未开始时只记录并发数
		expect(current.setConcurrency(2)).toBe(2);
		expect(count).toBe(0);

		current.start();
		await current.pause();

		const record = count;
		current.setConcurrency(10);
		await sleep(20);
		// 暂停期间不启动新任务
		expect(count).toBe(record);

		// 恢复时按新的并发数补齐
		expect(current.resume()).toBe(current);
		await sleep(1);
		expect(count - record).toBe(10);

		await current.cancel();
	});

	it('skipError: false', async () => {
		const done = vi.fn();
		const current = Parallel.of(
			[
				async () => 1,
				// 同步抛错同样视为该任务失败
				() => {
					throw new Error('Hello Parallels!');
				},
				done
			],
			1,
			{ skipError: false }
		);

		await expect(current.start()).rejects.toThrow('Hello Parallels!');
		expect(done).toBeCalledTimes(0);
		expect(current.target).toBe(null);
	});

	it('cancel / restart, in listener', async () => {
		const order: number[] = [];
		const current = Parallel.of(
			[1, 2, 3].map(i => async () => {
				order.push(i);
				return i;
			}),
			1
		);

		current.once('fulfilled', () => {
			current.cancel();
		});

		await expect(current.start()).rejects.toBeInstanceOf(CancelError);
		await sleep(5);
		// 监听器内取消后，这一轮不再推进
		expect(order).toEqual([1]);

		// 再次取消没有副作用
		await current.cancel();

		// 连续重启只会有一轮在执行
		const [results] = await Promise.all([current.restart(), current.restart()]);
		expect(results.map((i: any) => i.value)).toEqual([1, 2, 3]);
		expect(order).toEqual([1, 1, 2, 3]);
	});

	it('restart, without unhandled rejection', async () => {
		const current = Parallel.of(async () => sleep(5), 2);

		// restart的返回值没有被处理时，取消也不应产生unhandledRejection
		current.restart();
		await sleep(10);
		await current.cancel();
		await sleep(10);

		expect(current.isCancel).toBe(true);
	});
});
