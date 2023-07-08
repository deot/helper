import * as FP from '@deot/helper-fp';

const { Parallel, Task } = FP;
const sleep = (s: number) => new Promise(_ => { setTimeout(_, s || 0); });

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
		let len = current.tasks.length;
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
		let gen = () => {
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

		await sleep(30);

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

		// 取消之后会一直处于pending
		let message = await Promise.race([new Promise(_ => { setTimeout(() => _('CANCELED'), 50); }), target1]);
		expect(message).toBe('CANCELED');
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
		let gen = () => {
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

		// 取消之后会一直处于pending
		let message = await Promise.race([new Promise(_ => { setTimeout(() => _('CANCELED'), 50); }), target1]);
		expect(message).toBe('CANCELED');
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
});
