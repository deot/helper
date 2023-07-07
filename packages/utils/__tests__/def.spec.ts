import * as Utils from '@deot/helper-utils';

describe('def.ts', () => {
	it('basic', async () => {
		let target: any = {};
		Utils.def(target, 'value', 1);

		expect(target.value).toBe(1);
	});
});

