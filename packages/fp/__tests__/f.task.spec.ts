import * as FP from '@deot/helper-fp';

const { Task } = FP;
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

describe('io.ts', () => {
	it('serial', async () => {
		let current = Task.of('Hello Pointeds!')
			.map(R.toUpper)
			.map(R.identity);

		await current.run();
		expect(current.valueOf()).toBe('HELLO POINTEDS!');
		expect(current.isComplete()).toBe(true);
		expect(current.toString()).toMatch('Task');
	}, 60000);
});
