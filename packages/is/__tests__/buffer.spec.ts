import * as Is from '@deot/helper-is';

describe('buffer.ts', () => {
	const arrayBuffer = new ArrayBuffer(12);
	const buffer = Buffer.from('2');

	it('Basic', () => {
		expect(Is.buffer()).toBe(false);
		expect(Is.buffer(arrayBuffer)).toBe(false);
		expect(Is.buffer(buffer)).toBe(true);
	});
});
