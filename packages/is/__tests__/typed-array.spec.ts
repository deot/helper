import * as Is from '@deot/helper-is';

describe('typed-array.ts', () => {
	const buffer = new ArrayBuffer(12);
	const value = new DataView(buffer);
	const uint8 = new Uint8Array(10);
	it('Basic', () => {
		expect(Is.typedArray()).toBe(false);
		expect(Is.typedArray(buffer)).toBe(false);
		expect(Is.typedArray(value)).toBe(false);
		expect(Is.typedArray(uint8)).toBe(true);
	});
});
