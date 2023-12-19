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
		const reject = vi.fn(scheduler.finishWithError);
		setTimeout(reject, 10);
		try {
			await scheduler;
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler;
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler.next();
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler.nextWithError();
		} catch {
			expect(reject).toBeCalledTimes(1);
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

	it('next, microtask', async () => {
		expect.assertions(2);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		Promise.resolve().then(next);

		// 这里的_task还是上一个
		scheduler.then(() => {
			expect(next).toBeCalledTimes(1);
		});

		scheduler.then(() => {
			expect(next).toBeCalledTimes(1);
		});

		await Promise.resolve();
	});

	it('next, microtask-1', async () => {
		expect.assertions(0);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);

		await next();
		scheduler.then(() => {
			expect(1).toBe(1);
		});
	}, 1000);

	it('next, microtask-2', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);

		next(); // 生成的task是一个微任务
		scheduler.then(() => { // 这里还是上一个task
			expect(1).toBe(1);
		});
	}, 1000);

	it('next, microtask-3', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);

		next();
		await scheduler;
		expect(1).toBe(1);
	}, 1000);

	it('next, microtask-4', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.nextWithError);

		next().catch(() => {});
		try {
			await scheduler;
		} catch {
			expect(1).toBe(1);
		};
	}, 1000);

	it('next, microtask, async/await', async () => {
		expect.assertions(3);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		Promise.resolve().then(next);

		// 这里的_task还是上一个
		await scheduler;
		expect(next).toBeCalledTimes(1);

		setTimeout(next, 10);
		await scheduler;
		expect(next).toBeCalledTimes(2);

		Promise.resolve().then(next);
		await scheduler;
		expect(next).toBeCalledTimes(3);
	}, 1000);

	it('nextWithError, microtask, async/await', async () => {
		expect.assertions(3);
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.nextWithError);
		try {
			Promise.resolve().then(next).catch(() => {});
			// 这里的_task还是上一个
			await scheduler;
		} catch {
			expect(next).toBeCalledTimes(1);
		}

		try {
			setTimeout(next, 10);
			await scheduler;
		} catch {
			expect(next).toBeCalledTimes(2);
		}

		try {
			Promise.resolve().then(next).catch(() => {});
			await scheduler;
		} catch {
			expect(next).toBeCalledTimes(3);
		}
	}, 1000);
});
