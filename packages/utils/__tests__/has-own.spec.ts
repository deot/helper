import * as Utils from '@deot/helper-utils';

describe('has-own.ts', () => {
	it('true', () => {
		const target = { a: 1 };
		expect(Utils.hasOwn(target, 'a')).toBe(true);
	});

	it('false', () => {
		const target = {};
		expect(Utils.hasOwn(target, 'a')).toBe(false);
	});
});
