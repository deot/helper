import * as Utils from '@deot/helper-utils';

describe('random.ts', () => {
	it('range', () => {
		const result = {};
		const total = 20000000;
		const min = 1;
		const max = 100;
		for (let i = 0; i <= total; i++) {
			let key = Utils.range(min, max);
			if (!result[key]) result[key] = 0;
			result[key] += 1;
		}

		// 与0.01的概率的误差;
		for (let i = min; i <= max; i++) {
			let errorRange = Math.abs(1 / 100 - result[i] / total);
			expect(errorRange).toBeLessThan(0.001);
		}
	});

	it('weight', () => {
		// 这是中奖假设的概率，假设为100份，索引1中奖的概率为1%
		const probs = [10, 40, 5, 1, 15, 25, 4];
		const sum = probs.reduce((a, b) => a + b);

		const result = {};
		const total = 1000000;
		for (let i = 0; i <= total; i++) {
			let key = Utils.probs(probs);
			if (!result[key]) result[key] = 0;
			result[key] += 1;
		}

		// 与0.01的概率的误差;
		for (let i = 0; i < probs.length; i++) {
			let errorRange = Math.abs((result[i] / total) - (probs[i] / sum));
			expect(errorRange).toBeLessThan(0.001);
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
});

