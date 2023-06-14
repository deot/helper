import * as FP from '@deot/helper-fp';

const { Task, Monad } = FP;
const sleep = (s: number) => new Promise(_ => { setTimeout(_, s || 0); });
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

		let current = Task.of('Hello Tasks!')
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
		const current = Task.of('Hello Tasks!')
			.map(async (x: any) => {
				await sleep(30);
				return x;
			})
			.start();
		await sleep(10);
		current.cancel();
		current.end();

		expect(current.cancelHooks.length).toBe(1);
	});

	it('start / immediate', async () => {
		expect.assertions(1);
		let current = Task.of('Hello Tasks!')
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
		let current = Task.of('Hello Tasks!')
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

	it('catch / then', async () => {
		expect.assertions(2);

		
		let message = 'ERROR';
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

	it('Monadic: map / flatMap / valueOf / toString', async () => {
		expect.assertions(3);
		let current = Task.of(Task.of(Task.of(Monad.of(Task.of('Hello Tasks!')))))
			.flatMap(R.toUpper)
			.map(R.identity)
			.start();

		await current.value;
		expect(current.valueOf()).toBe('HELLO TASKS!');
		expect(current.isComplete).toBe(true);
		expect(current.toString()).toMatch('Task');
	}, 60000);
});
