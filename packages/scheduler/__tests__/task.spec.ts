import { Task, CancelError, isCancelError } from '@deot/helper-scheduler';

const sleep = (s: number) => new Promise((_) => { setTimeout(_, s || 0); });
const R = {
	toUpper: async (x: string) => {
		await sleep(0);
		return x.toUpperCase();
	},
	identity: async (x: any) => {
		await sleep(0);
		return x;
	}
};

describe('task.ts', () => {
	it('lazy', async () => {
		Task.of('Hello Tasks!')
			.map((x: any) => {
				console.error('Need Skip');
				return x;
			});
	});

	it('serial: then / reduce', async () => {
		expect.assertions(3);

		const current = Task.of('Hello Tasks!')
			.map(R.toUpper)
			.map((x: any) => {
				return ['.', '.'].reduce((pre: any, cur: any) => {
					return pre.then((v: any) => v + cur);
				}, Promise.resolve(x));
			})
			.reduce(() => [',', ','], (pre: any, cur: any) => {
				return pre + cur;
			})
			.reduce(['/', '/'], (pre: any, cur: any) => {
				return pre + cur;
			})
			.map(R.identity)
			.start();

		await current.value;
		expect(current.valueOf()).toBe('HELLO TASKS!..,,//');
		expect(current.isComplete).toBe(true);
		expect(current.toString()).toMatch('Task');
	});

	it('cancel / end', async () => {
		expect.assertions(6);
		const onCancel = vi.fn();
		const onCancelLate = vi.fn();
		let signal: AbortSignal | undefined;
		const current = Task.of('Hello Tasks!')
			.map(async (x: any, context) => {
				context.onCancel(onCancel);
				signal = context.signal;
				await sleep(30);
				// 已取消后注册的清理逻辑会立即执行
				context.onCancel(onCancelLate);
				return x;
			})
			.start();
		await sleep(10);
		current.cancel();
		current.end();

		expect(onCancel).toBeCalledTimes(1);
		expect(signal!.aborted).toBe(true);
		expect(current.isCancel).toBe(true);
		expect(current.isComplete).toBe(false);

		// 等待者收到CancelError，而不是永久pending
		await expect(current.toPromise()).rejects.toBeInstanceOf(CancelError);

		await sleep(30);
		expect(onCancelLate).toBeCalledTimes(1);
	});

	it('cancel, before start', async () => {
		expect.assertions(3);
		const fn = vi.fn();
		const current = Task.of('Hello Tasks!').map(fn).map(fn);

		current.cancel();
		try {
			await current.toPromise();
		} catch (e: any) {
			expect(isCancelError(e)).toBe(true);
			expect(isCancelError({ name: 'CancelError' })).toBe(true);
		}
		expect(fn).toBeCalledTimes(0);
	});

	it('cancel, after complete', async () => {
		const current = Task.of('Hello Tasks!').map(R.identity);

		await current.toPromise();
		current.cancel();

		expect(current.isCancel).toBe(false);
		expect(current.isComplete).toBe(true);
	});

	it('cancel, signal unsupported', async () => {
		expect.assertions(2);
		vi.stubGlobal('AbortController', undefined);

		let signal: any = 'unset';
		const onCancel = vi.fn();
		const current = Task.of('Hello Tasks!')
			.map(async (x: any, context) => {
				signal = context.signal;
				context.onCancel(onCancel);
				await sleep(20);
				return x;
			})
			.start();

		await sleep(5);
		current.cancel();
		vi.unstubAllGlobals();

		expect(signal).toBe(undefined);
		expect(onCancel).toBeCalledTimes(1);
	});

	it('cancel, hook throws', async () => {
		const parentHook = vi.fn();
		const current = Task.of('Hello Tasks!')
			.map(async (x: any, context) => {
				context.onCancel(parentHook);
				return x;
			})
			.map(async (x: any, context) => {
				context.onCancel(() => {
					throw new Error('hook');
				});
				await sleep(20);
				return x;
			})
			.start();

		await sleep(5);
		expect(() => current.cancel()).toThrow('hook');

		// 清理逻辑异常不影响父节点取消
		expect(current.parent!.isComplete || current.parent!.isCancel).toBe(true);
		expect(current.isCancel).toBe(true);
	});

	it('reject with falsy value', async () => {
		expect.assertions(3);

		await expect(Task.of(1).map(() => Promise.reject(0)).toPromise()).rejects.toBe(0);

		await expect(Task.of(1).map(() => Promise.reject()).toPromise()).rejects.toBe(undefined);

		const current = Task.of(1).map(() => {
			throw '';
		});
		await expect(current.toPromise()).rejects.toBe('');
	});

	it('start / immediate', async () => {
		expect.assertions(1);
		const current = Task.of('Hello Tasks!')
			.start()
			.immediate()
			.map(R.identity)
			.map(R.toUpper)
			.map(R.identity);

		await current.toPromise();
		expect(current.valueOf()).toBe('HELLO TASKS!');
	});

	it('pasue / resume', async () => {
		expect.assertions(2);
		const current = Task.of('Hello Tasks!')
			.map(R.toUpper)
			.map(R.identity)
			.map(async (x: any) => {
				await sleep(10);
				return x;
			})
			.map(async (x: any) => {
				await sleep(10);
				return x + '!';
			})
			.start();

		await sleep(10);
		current.pasue();

		await sleep(50);
		expect(current.isComplete).toBe(false);

		current.resume();
		current.pasue();
		current.resume();

		await current.value;

		expect(current.valueOf()).toBe('HELLO TASKS!!');
	});

	it('pause / resume, idempotent', async () => {
		const current = Task.of('Hello Tasks!').map(R.toUpper);

		// 未暂停时恢复不会抛错
		expect(() => current.resume()).not.toThrow();

		// 重复暂停不会让之前的等待者被遗弃
		current.pause();
		const pauser = current.pauser;
		current.pause();
		expect(current.pauser).toBe(pauser);
		expect(current.pasuer).toBe(pauser);
		expect(current.isPause).toBe(true);

		current.start();
		await sleep(10);
		expect(current.isComplete).toBe(false);

		current.resume();
		expect(await current.toPromise()).toBe('HELLO TASKS!');
		expect(current.isPause).toBe(false);
	});

	it('catch / then', async () => {
		expect.assertions(2);

		const message = 'ERROR';
		Task.of('Hello Tasks!')
			.map(async () => {
				throw new Error(message);
			})
			.map(R.identity)
			.toPromise()
			.catch((e: any) => {
				expect(e.message).toBe(message);
				return e.message;
			})
			.then((e: any) => {
				expect(e).toBe(message);
			});

		await sleep(0);
	});

	it('restart', async () => {
		expect.assertions(3);

		const current = Task.of('Hello Tasks!')
			.map(R.toUpper)
			.map(R.identity)
			.cancel()
			.restart();

		await current.toPromise();

		expect(current.valueOf()).toBe('HELLO TASKS!');

		const noParent = Task.of('Hello Tasks!').restart();
		expect(noParent.value).toBe('Hello Tasks!');

		const noChild = Task.of('Hello Tasks!').map(R.toUpper).restart();
		await noChild.toPromise();

		expect(noChild.valueOf()).toBe('HELLO TASKS!');
	});

	it('restart, branch', async () => {
		const root = Task.of('Hello Tasks!');
		const upper = root.map(R.toUpper);
		const suffix = root.map(async (x: string) => x + '!');

		// 沿 根 -> 当前节点 的路径重放，而不是最先或最后派生的分支
		expect(await upper.restart().toPromise()).toBe('HELLO TASKS!');
		expect(await suffix.restart().toPromise()).toBe('Hello Tasks!!');
	});

	it('restart, falsy value', async () => {
		const current = Task.of(5).map(R.identity);

		expect(await current.restart(0).toPromise()).toBe(0);
		expect(await current.restart('').toPromise()).toBe('');
		expect(await current.restart().toPromise()).toBe(5);
	});

	it('restart, reduce collection', async () => {
		let count = 0;
		const current = Task.of('')
			.reduce(() => [++count], (pre: any, cur: any) => pre + cur);

		expect(await current.toPromise()).toBe('1');
		// collection每次都会重新求值
		expect(await current.restart().toPromise()).toBe('2');
	});

	it('flatMap', async () => {
		expect.assertions(4);
		const current = Task.of(Task.of(Task.of('Hello Tasks!')))
			.flatMap(R.toUpper)
			.flatMap((x: string) => Task.of(x).map(R.identity))
			.map(R.identity)
			.start();

		await current.value;
		expect(current.valueOf()).toBe('HELLO TASKS!');
		expect(current.isComplete).toBe(true);
		expect(current.toString()).toMatch('Task');

		// map不会展平Task
		const inner = Task.of('Hello Tasks!');
		expect(await Task.of(1).map(() => inner).toPromise()).toBe(inner);
	});

	it('flatMap, cancel inner', async () => {
		const onCancel = vi.fn();
		const current = Task.of('Hello Tasks!')
			.flatMap((x: string) => {
				return Task.of(x).map(async (v: string, context) => {
					context.onCancel(onCancel);
					await sleep(30);
					return v;
				});
			})
			.start();

		await sleep(10);
		current.cancel();

		expect(onCancel).toBeCalledTimes(1);
		await expect(current.toPromise()).rejects.toBeInstanceOf(CancelError);
	});

	it('types', () => {
		expectTypeOf(Task.of('Hello Tasks!')).toEqualTypeOf<Task<string>>();
		expectTypeOf(Task.of(Promise.resolve(1))).toEqualTypeOf<Task<number>>();
		expectTypeOf(Task.of(1).map(x => String(x))).toEqualTypeOf<Task<string>>();
		expectTypeOf(Task.of(1).map(async x => x > 0)).toEqualTypeOf<Task<boolean>>();
		expectTypeOf(Task.of(1).toPromise()).toEqualTypeOf<Promise<number>>();
	});
});
