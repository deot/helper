import * as FP from '@deot/helper-fp';

const { reverse } = FP;

describe('reverse.ts', () => {
	it('array', () => {
		const v = [1, 2, 3];
		expect(reverse(v)).toEqual([3, 2, 1]);

		// 不改变原数据
		expect(v).toEqual([1, 2, 3]);
	});

	it('string', () => {
		expect(reverse('123')).toBe('321');
	});

	it('object', () => {
		const target = {} as any[];
		expect(reverse(target)).toBe(target);
	});
});
