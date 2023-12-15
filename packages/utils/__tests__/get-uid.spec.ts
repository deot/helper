import * as Utils from '@deot/helper-utils';

describe('get-uid.ts', () => {
	it('basic', () => {
		expect(Utils.getUid()).not.toBe(Utils.getUid());
		expect(Utils.getUid('1')).not.toBe(Utils.getUid('1'));
	});
});
