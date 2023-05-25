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

	it('start avoid repeat', async () => {
		let count$ = 0;
		const current$ = Job.of(
			Task.of('Hello Tasks!')
				.map(R.toUpper)
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
				await sleep(1);
				count$++;
			},
			9
		);
		expect.assertions(6);
		
		// 开始
		current$.start();
		await sleep(30);
		expect(count$).not.toBe(record);

		// 暂停
		current$.pasue();
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

		expect(count$).toBeGreaterThanOrEqual(9);
	});

	it('for coverage', async () => {
		let count$ = 0;
		const current$ = Job.of(
			Task.of('Hello Tasks!')
				.map(R.toUpper)
				.map((v: any) => {
					count$++;
					return v;
				})
				.cancel()
				.start()
		);

		current$.immediate();
		expect(current$.isStart).toBe(true);
		await sleep(5);
		
		expect(count$).not.toBe(0);

		current$.cancel();
		current$.end();
	});
});
