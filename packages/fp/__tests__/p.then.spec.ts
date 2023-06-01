import * as FP from '@deot/helper-fp';

describe('then.ts', () => {
	it('base', () => {
		let safe = FP.then((e) => {
			expect(e).toBe('then');
		});

		safe(Promise.resolve('then'));
	});
});
