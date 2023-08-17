import * as Is from '@deot/helper-is';

describe('array-buffer.ts', () => {
	let buffer = new ArrayBuffer(12);
	let value = new DataView(buffer);

	it('Basic', () => {
		expect(Is.arrayBuffer()).toBe(false);
		expect(Is.arrayBuffer(buffer)).toBe(true);
		expect(Is.arrayBuffer(value)).toBe(false);
	});
});

