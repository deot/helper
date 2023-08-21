import * as Is from '@deot/helper-is';

describe('typed-array.ts', () => {
	let buffer = new ArrayBuffer(12);
	let value = new DataView(buffer);
	let uint8 = new Uint8Array(10);
	it('Basic', () => {
		expect(Is.typedArray()).toBe(false);
		expect(Is.typedArray(buffer)).toBe(false);
		expect(Is.typedArray(value)).toBe(false);
		expect(Is.typedArray(uint8)).toBe(true);
	});
});

