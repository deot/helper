import * as FP from '@deot/helper-fp';

describe('try-catch.ts', () => {
	it('base', () => {
		let safe = FP.tryCatch((e) => {
			expect(e).toBe('error');
		});

		// eslint-disable-next-line
		safe(Promise.reject('error'));
	});
});
