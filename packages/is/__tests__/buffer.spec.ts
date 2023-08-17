import * as Is from '@deot/helper-is';

describe('buffer.ts', () => {
	let arrayBuffer = new ArrayBuffer(12);
	let buffer = Buffer.from('2');

	it('Basic', () => {
		expect(Is.buffer()).toBe(false);
		expect(Is.buffer(arrayBuffer)).toBe(false);
		expect(Is.buffer(buffer)).toBe(true);
	});
});

