import * as Utils from '@deot/helper-utils';

describe('pre-zero.ts', () => {
	it('basic', () => {
		expect(Utils.preZero(1)).toBe('01');
		expect(Utils.preZero(0)).toBe('00');
		expect(Utils.preZero(10)).toBe('10');
	});
});
