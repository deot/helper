import * as FP from '@deot/helper-fp';

describe('then.ts', () => {
	it('base', () => {
		const safe = FP.then$((e: any) => {
			expect(e).toBe('then');
		});

		safe(Promise.resolve('then'));
	});
});
