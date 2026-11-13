import * as Utils from '@deot/helper-utils';

describe('asterisk.ts', () => {
	it('basic', () => {
		expect(Utils.asterisk('18888888888')).toBe(`188****8888`);
		expect(Utils.asterisk('')).toBe(`****`);
	});

	it('from / length', () => {
		expect(Utils.asterisk('18888888888', 0, 3)).toBe(`***88888888`);
		expect(Utils.asterisk('18888888888', 3, 0)).toBe(`18888888888`);
		expect(Utils.asterisk('18888888888', 7)).toBe(`1888888****`);
		expect(Utils.asterisk('18888888888', undefined, 2)).toBe(`188**888888`);
	});

	it('非法的 from / length', () => {
		expect(Utils.asterisk('18888888888', -1, -1)).toBe(`18888888888`);
		expect(Utils.asterisk('18888888888', 3.5, 1.5)).toBe(`188*8888888`);
		expect(Utils.asterisk('18888888888', NaN, NaN)).toBe(`18888888888`);
	});
});
