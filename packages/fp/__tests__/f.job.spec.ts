import * as FP from '@deot/helper-fp';

const { Task, Job } = FP;
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

let count = 0;
const current = Job.of(
	Task.of('Hello Tasks!')
		.map(R.toUpper)
		.map((v: any) => {
			count++;
			return v;
		}),
	9
);

describe('job.ts', () => {
	it('start', async () => {
		let record = count;

		current.start();
		await sleep(30);
		expect(count).not.toBe(record);
	});

	it('pasue', async () => {
		let record = count;

		current.pasue();
		await sleep(30);
		expect(count).toBe(record);
	});

	it('resume', async () => {
		let record = count;

		current.resume();
		await sleep(30);
		expect(count).not.toBe(record);
	});

	it('cancel', async () => {
		let record = count;

		current.cancel();
		await sleep(30);
		expect(count).toBe(record);
	});
	
	it('restart', async () => {
		let record = count;

		current.restart();
		await sleep(30);
		expect(count).not.toBe(record);
		current.cancel();
	});
});
