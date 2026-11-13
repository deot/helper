import * as Utils from '@deot/helper-utils';

describe('random.ts', () => {
	it('range', () => {
		const result = {};
		const total = 20000000;
		const min = 1;
		const max = 100;
		for (let i = 0; i <= total; i++) {
			const key = Utils.range(min, max);
			if (!result[key]) result[key] = 0;
			result[key] += 1;
		}

		// 与0.01的概率的误差;
		for (let i = min; i <= max; i++) {
			const errorRange = Math.abs(1 / 100 - result[i] / total);
			expect(errorRange).toBeLessThan(0.001);
		}
	});

	it('weight', () => {
		// 这是中奖假设的概率，假设为100份，索引1中奖的概率为1%
		const probs = [10, 40, 5, 1, 15, 25, 4];
		const sum = probs.reduce((a, b) => a + b);

		const result = {};
		const total = process.env.CI ? 10000000 : 1000000;
		for (let i = 0; i <= total; i++) {
			const key = Utils.probs(probs);
			if (!result[key]) result[key] = 0;
			result[key] += 1;
		}

		// 与0.01的概率的误差;
		for (let i = 0; i < probs.length; i++) {
			const p = probs[i] / sum;
			const errorRange = Math.abs((result[i] / total) - p);
			// 容差取 5 倍标准差，避免样本量较小时偶发失败
			expect(errorRange).toBeLessThan(5 * Math.sqrt(p * (1 - p) / total));
		}
	});

	it('error', () => {
		expect.assertions(1);
		const probs = [0, 0];
		try {
			Utils.probs(probs);
		} catch (e: any) {
			expect(e.message).toMatch('不可能得到索引值');
		}
	});

	it('error: 仅有无效权重', () => {
		expect(() => Utils.probs([-1, NaN, 0])).toThrow('不可能得到索引值');
		expect(() => Utils.probs([])).toThrow('不可能得到索引值');
	});

	it('忽略非正数权重', () => {
		const weights = [-1, 1, 0, NaN, 1, -5];
		for (let i = 0; i <= 10000; i++) {
			expect([1, 4]).toContain(Utils.probs(weights));
		}
	});

	it('Math.random 边界', () => {
		const random = vi.spyOn(Math, 'random');
		try {
			// 取到 0 时落在第一个有效权重
			random.mockReturnValue(0);
			expect(Utils.probs([1, 1])).toBe(0);
			expect(Utils.probs([0, 1, 1])).toBe(1);

			// 无限接近 1 时落在最后一个有效权重，不越界
			random.mockReturnValue(1 - 2 ** -53);
			expect(Utils.probs([1, 1])).toBe(1);
			expect(Utils.probs([0.1, 0.2, 0.7, 0])).toBe(2);
			expect(Utils.probs([-1, 1])).toBe(1);

			random.mockReturnValue(0.5);
			expect(Utils.probs([-1, 1])).toBe(1);
			expect(Utils.probs([1, 2, 1])).toBe(1);
		} finally {
			random.mockRestore();
		}
	});
});
