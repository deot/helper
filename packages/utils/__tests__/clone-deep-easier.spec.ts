import * as Utils from '@deot/helper-utils';

describe('clone-deep-easier.ts', () => {
	it('basic', () => {
		const target = { a: 'any' };
		expect(Utils.cloneDeepEasier(target)).toEqual(target);
		expect(Utils.cloneDeepEasier(target) !== target).toBe(true);
	});
});
