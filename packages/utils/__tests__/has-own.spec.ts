import * as Utils from '@deot/helper-utils';

describe('has-own.ts', () => {
	it('true', () => {
		let target = { a: 1 };
		expect(Utils.hasOwn(target, 'a')).toBe(true);
	});

	it('false', () => {
		let target = {};
		expect(Utils.hasOwn(target, 'a')).toBe(false);
	});
});

