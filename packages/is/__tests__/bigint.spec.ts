import * as Is from '@deot/helper-is';

describe('bigint.ts', () => {
	it('Basic', () => {
		expect(Is.bigint()).toBe(false);
		expect(Is.bigint(1n)).toBe(true);
		expect(Is.bigint(BigInt(1))).toBe(true);
		expect(Is.bigint(1)).toBe(false);
		expect(Is.bigint('1')).toBe(false);
		expect(Is.number(1n)).toBe(false);
	});
});
