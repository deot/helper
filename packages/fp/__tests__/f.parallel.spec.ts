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
				await sleep(1);
				count++;
			};
		};
		const current = Parallel.of(
			Array.from({ length: 100 }).map(gen),
			4
		);

		const target = current.start();

		await sleep(25);
		expect(count).not.toBe(100);
		expect(count).toBeGreaterThan(50);

		await target;
		expect(count).toBe(100);

		const target1 = current.restart();
		await sleep(25);
		current.cancel();

		expect(count).toBeGreaterThan(100);
		expect(count).toBeLessThan(200);

		// 取消之后会一直处于pending
		let message = await Promise.race([new Promise(_ => { setTimeout(() => _('CANCELED'), 50); }), target1]);
		expect(message).toBe('CANCELED');
	});
});
