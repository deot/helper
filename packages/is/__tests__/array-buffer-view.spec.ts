import * as Is from '@deot/helper-is';

describe('array-buffer-view.ts', () => {
	const buffer = new ArrayBuffer(12);

	it('Basic', () => {
		expect(Is.arrayBufferView()).toBe(false);
		expect(Is.arrayBufferView(new DataView(buffer))).toBe(true);
		expect(Is.arrayBufferView(new Uint8Array(buffer))).toBe(true);
		expect(Is.arrayBufferView(buffer)).toBe(false);
	});

	it('始终返回布尔值', () => {
		expect(Is.arrayBufferView(null)).toBe(false);
		expect(Is.arrayBufferView(0)).toBe(false);
		expect(Is.arrayBufferView('')).toBe(false);
		expect(Is.arrayBufferView({})).toBe(false);
		// 仅结构相似不算
		expect(Is.arrayBufferView({ buffer })).toBe(false);
	});
});
