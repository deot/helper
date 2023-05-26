import * as FP from '@deot/helper-fp';

const { Parallel } = FP;
const sleep = (s: number) => new Promise(_ => { setTimeout(_, s || 0); });
const R = {
	toUpper: async (x: string) => {
		await sleep(0);
		return x.toUpperCase();
	}
};

describe('parallel.ts', () => {
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
		await sleep(25);
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
	});
});
