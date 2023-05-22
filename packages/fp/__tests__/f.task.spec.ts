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
	it('serial', async () => {
		expect.assertions(3);

		let current = Task.of('Hello Tasks!')
			.map(R.toUpper)
			.map(R.identity);

		await current.run();
		expect(current.valueOf()).toBe('HELLO TASKS!');
		expect(current.isComplete()).toBe(true);
		expect(current.toString()).toMatch('Task');
	}, 60000);

	it('error', async () => {
		expect.assertions(2);
		
		let message = 'ERROR';
		Task.of('Hello Tasks!')
			.map(async () => {
				throw new Error(message);
			})
			.map(R.identity)
			.run()
			.catch(e => {
				expect(e.message).toBe(message);
				return e.message;
			})
			.then((e) => {
				expect(e).toBe(message);
			});
	}, 60000);

	it('Monadic: map / flatMap / valueOf / toString', async () => {
		expect.assertions(3);
		let current = Task.of(Task.of(Task.of(Monad.of(Task.of('Hello Tasks!')))))
			.flatMap(R.toUpper)
			.map(R.identity);

		await current.run();
		expect(current.valueOf()).toBe('HELLO TASKS!');
		expect(current.isComplete()).toBe(true);
		expect(current.toString()).toMatch('Task');
	}, 60000);
});
