import * as FP from '@deot/helper-fp';

const { reduce } = FP; // 同ramda api，不同于loadsh（第一个参数为值）

describe('reduce.ts', () => {
	it('array', () => {
		let fn = reduce((a: any, b: any) => (a - b), 0);

		// ((((0 - 1) - 2) - 3) - 4) = -10
		expect(fn([1, 2, 3, 4])).toBe(-10);
	});
});
