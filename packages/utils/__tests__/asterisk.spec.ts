import * as Utils from '@deot/helper-utils';

describe('asterisk.ts', () => {
	it('basic', () => {
		expect(Utils.asterisk('18888888888')).toBe(`188****8888`);
		expect(Utils.asterisk('')).toBe(`****`);
	});
});
