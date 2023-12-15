import * as Is from '@deot/helper-is';

describe('array-buffer-view.ts', () => {
	const buffer = new ArrayBuffer(12);
	const value = new DataView(buffer);

	it('Basic', () => {
		expect(Is.arrayBufferView()).toBe(false);
		expect(Is.arrayBufferView(value)).toBe(true);
	});

	it('ArrayBuffer, undefined', () => {
		Object.defineProperty(globalThis, 'ArrayBuffer', { value: undefined });
		expect(Is.arrayBufferView(value)).toBe(true);
	});
});
