import * as Is from '@deot/helper-is';

describe('array-buffer.ts', () => {
	const buffer = new ArrayBuffer(12);
	const value = new DataView(buffer);

	it('Basic', () => {
		expect(Is.arrayBuffer()).toBe(false);
		expect(Is.arrayBuffer(buffer)).toBe(true);
		expect(Is.arrayBuffer(value)).toBe(false);
	});
});
