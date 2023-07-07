import * as Utils from '@deot/helper-utils';

describe('is-obj.ts', () => {
	it('basic', () => {
		expect(Utils.isObj(null)).toBe(true);
		expect(Utils.isObj([])).toBe(true);
		expect(Utils.isObj({})).toBe(true);
		expect(Utils.isObj()).toBe(false);
		expect(Utils.isObj(1)).toBe(false);
		expect(Utils.isObj('')).toBe(false);
		expect(Utils.isObj(true)).toBe(false);
		expect(Utils.isObj(() => {})).toBe(false);
	});
});

