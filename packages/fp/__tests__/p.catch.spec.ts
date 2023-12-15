import * as FP from '@deot/helper-fp';

describe('catch.ts', () => {
	it('base', () => {
		const safe = FP.catch$((e: any) => {
			expect(e).toBe('error');
		});

		// eslint-disable-next-line
		safe(Promise.reject('error'));
	});
});
