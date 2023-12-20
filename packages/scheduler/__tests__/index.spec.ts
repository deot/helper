import { Scheduler } from '@deot/helper-scheduler';

describe('scheduler.ts', () => {
	it('next', async () => {
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		const fail = vi.fn(scheduler.nextWithError);
		setTimeout(next, 10);
		await scheduler;

		expect(next).toBeCalledTimes(1);
		expect(fail).toBeCalledTimes(0);

		setTimeout(next, 10);
		await scheduler;
		expect(next).toBeCalledTimes(2);
		expect(fail).toBeCalledTimes(0);

		try {
			setTimeout(fail, 10);
			await scheduler;
		} catch {
			expect(next).toBeCalledTimes(2);
			expect(fail).toBeCalledTimes(1);
		}

		setTimeout(next, 10);
		await scheduler;
		expect(next).toBeCalledTimes(3);
		expect(fail).toBeCalledTimes(1);
	});

	it('finish', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const resolve = vi.fn(scheduler.finish);
		setTimeout(resolve, 10);
		await scheduler;

		await scheduler.next();
		await scheduler.nextWithError();
		await scheduler;
		await scheduler;
		await scheduler;
		await scheduler;

		expect(resolve).toBeCalledTimes(1);
	});

	it('finishWithError', async () => {
		expect.assertions(4);
		const scheduler = new Scheduler();
		const finishWithError = vi.fn(scheduler.finishWithError);
		setTimeout(finishWithError, 10);
		try {
			await scheduler;
		} catch {
			expect(finishWithError).toBeCalledTimes(1);
		}

		try {
			await scheduler;
		} catch {
			expect(finishWithError).toBeCalledTimes(1);
		}

		try {
			await scheduler.next();
		} catch {
			expect(finishWithError).toBeCalledTimes(1);
		}

		try {
			await scheduler.nextWithError();
		} catch {
			expect(finishWithError).toBeCalledTimes(1);
		}
	});

	it('catch', async () => {
		expect.assertions(2);
		const scheduler = new Scheduler();
		const reject = vi.fn(scheduler.finishWithError);
		setTimeout(reject, 10);

		scheduler.catch(() => {
			expect(reject).toBeCalledTimes(1);
		});

		try {
			await scheduler;
		} catch {
			expect(reject).toBeCalledTimes(1);
		}
	});

	it('finally', async () => {
		expect.assertions(2);
		const scheduler = Scheduler.of({});
		const resolve = vi.fn(scheduler.finish);
		setTimeout(resolve, 10);

		scheduler.finally(() => {
			expect(resolve).toBeCalledTimes(1);
		});

		scheduler.finally(() => {
			expect(resolve).toBeCalledTimes(1);
		});

		await scheduler;
	});

	/**
	 * 由于是微任务执行next，scheduler.then优先执行;
	 * 1. scheduler.then中的_task为上一个
	 */
	it('next, microtask', async () => {
		expect.assertions(2);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		Promise.resolve().then(next);

		scheduler.then(() => {
			expect(next).toBeCalledTimes(1);
		});

		scheduler.then(() => {
			expect(next).toBeCalledTimes(1);
		});

		await Promise.resolve();
	});

	/**
	 * 实现的目的：`await scheduler`上面有任何代码执行next，才会结束等待，不论它是同步，微任务，异步执行
	 * 由于是微任务执行next，scheduler.then优先执行;
	 * 1. scheduler中的_task为上一个
	 *
	 * 从程序角度分析执行顺序
	 * Promise.resolve(1).then(console.log);
	 * await Promise.resolve(2).then(console.log);
	 * 输出1,2（先执行微任务1，再执行微任务2）
	 *
	 * Scheduler设计类似使用如下
	 * Promise.resolve(1).then(console.log);
	 * await { then() { console.log(2) }};
	 * 输出1,2（先执行微任务1，再执行微任务2）
	 *
	 * 以上await它会转为微任务，不会直接执行then方法
	 * Promise.resolve().then(next);;
	 * await scheduler;;
	 *
	 * 会这样去执行（先执行微任务next，再执行微任务scheduler.then）
	 * Promise.resolve().then(next);
	 * Promise.resolve().then(scheduler);
	 * ...wait
	 *
	 * 也就是
	 * next();
	 * scheduler.then();
	 * ...wait
	 *
	 * 总结
	 * 为了让scheduler.then中的_task为上一个，必须让next生成新的_task在scheduler.then后再生成
	 * 为了实现此方案，必须调整next中生成新_task的方法, 且要在上一个_task完成后,即`await this._task`再重新生成
	 */
	it('next, microtask, async/await', async () => {
		expect.assertions(3);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		Promise.resolve().then(next);

		await scheduler;
		expect(next).toBeCalledTimes(1);

		setTimeout(next, 10);
		await scheduler;
		expect(next).toBeCalledTimes(2);

		Promise.resolve().then(next);
		await scheduler;
		expect(next).toBeCalledTimes(3);
	}, 1000);

	/**
	 * 同上理论
	 */
	it('nextWithError, microtask, async/await', async () => {
		expect.assertions(3);
		const scheduler = new Scheduler();
		const nextWithError = vi.fn(scheduler.nextWithError);
		try {
			Promise.resolve().then(nextWithError);
			await scheduler;
		} catch {
			expect(nextWithError).toBeCalledTimes(1);
		}

		try {
			setTimeout(nextWithError, 10);
			await scheduler;
		} catch {
			expect(nextWithError).toBeCalledTimes(2);
		}

		try {
			Promise.resolve().then(nextWithError);
			await scheduler;
		} catch {
			expect(nextWithError).toBeCalledTimes(3);
		}
	}, 1000);

	/**
	 * 由于microtask对next的重设计
	 * 使用await next()会导致
	 * 1. 使用await等待next()执行完成
	 * 2. scheduler.then中的_task为当前的，还处于pending状态
	 */
	it('next, invoke', async () => {
		expect.assertions(0);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);

		await next();
		scheduler.then(() => {
			expect(1).toBe(1);
		});
	}, 1000);

	/**
	 * 实现的目的：同上
	 *
	 * 由于microtask对next的重设计
	 *
	 * 经过上上面对microtask的分析, 对此分析此代码
	 * next();
	 * await scheduler;
	 *
	 * 转换
	 * next();
	 * Promise.resolve().then(scheduler)
	 * ...wait
	 *
	 * 1. 由于直接执行next()，微任务后生成新的_task
	 * 2. 然后再执行下一个微任务Promise.resolve()
	 * 3. 然后再执行scheduler.then拿到的_task是当前的
	 *
	 * 总结：
	 * 执行next让等待_task微任务完成后立即赋值_task
	 * 会让`await scheduler`中scheduler.then后拿到当前的_task，这并非本意
	 * 那么就在next中等待上一个_task完成后再增加一个微任务即`await Promise.resolve()`
	 */
	it('next, invoke, preTask', async () => {
		expect.assertions(2);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);

		next();

		scheduler.then(() => {
			expect(1).toBe(1);
		});
		await scheduler;
		expect(1).toBe(1);
	}, 1000);

	/**
	 * 同上理论
	 */
	it('nextWithError, invoke, preTask', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const nextWithError = vi.fn(scheduler.nextWithError);

		nextWithError();
		try {
			await scheduler;
		} catch {
			expect(1).toBe(1);
		};
	}, 1000);
});
