import * as FP from '@deot/helper-fp';

describe('sequence.ts', () => {
	it('base', () => {
		let count = 0;
		const f = FP.sequence(() => count++, () => count--);

		expect(f()).toBe(undefined);
		expect(count).toBe(0);
	});
});
